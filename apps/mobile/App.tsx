import {
  ITEM_NAME_MAX_LENGTH,
  LIFE_AREA_LABELS,
  LIFE_AREA_ORDER,
  WEEKDAYS,
  dateInputToIso,
  todayDateInputValue,
} from "@/constants";
import { tendFonts } from "@/fonts";
import { colors, fonts, radius, spacing } from "@/theme";
import type { ItemResponse, UserResponse } from "@/types";
import { getAttentionSectionDefaults } from "@/utils/homeGroups";
import { formatRelativeFromDays } from "@/utils/relativeTime";
import { type TabKey, getTabSwitchDirection } from "@/utils/tabTransition";
import { TendApi } from "@api/tendApi";
import { DatePickerField } from "@components/date-picker-field";
import { PresetSuggestions } from "@components/preset-suggestions";
import { RhythmPicker } from "@components/rhythm-picker";
import { TypeSelector } from "@components/type-selector";
import { useActivityEvents } from "@hooks/useActivityEvents";
import { useAvailabilityWindows } from "@hooks/useAvailabilityWindows";
import { useHomeItems } from "@hooks/useHomeItems";
import { usePushNotifications } from "@hooks/usePushNotifications";
import { lifeAreaFilterToggleLabel, t } from "@i18n";
import { PRESETS_BY_AREA } from "@tend/domain";
import type { LifeArea, TendItemType, TendPreset, TendStatus } from "@tend/domain";
import { isDevMode } from "@utils/devMode";
import { validateItemForm } from "@utils/itemFormValidation";
import { getErrorMessage } from "@utils/networkError";
import { restoreSession } from "@utils/sessionRestore";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  CalendarClock,
  Check,
  ChevronDown,
  Home,
  LogOut,
  Plus,
  Settings,
  SlidersHorizontal,
  Trash2,
} from "lucide-react-native";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ITEMS = [
  { key: "home", label: t("nav.home"), Icon: Home },
  { key: "activity", label: t("nav.activity"), Icon: Activity },
  { key: "add", label: t("nav.add"), Icon: Plus },
  { key: "availability", label: t("nav.availability"), Icon: CalendarClock },
  { key: "settings", label: t("nav.settings"), Icon: Settings },
] as const;

const AUTH_PROMO_SLIDES = [
  {
    key: "remember",
    image: require("./assets/promo/tend-remember.jpg"),
    title: t("auth.splash.remember.title"),
    description: t("auth.splash.remember.description"),
  },
  {
    key: "care",
    image: require("./assets/promo/tend-care.jpg"),
    title: t("auth.splash.care.title"),
    description: t("auth.splash.care.description"),
  },
  {
    key: "reminder",
    image: require("./assets/promo/tend-reminder.jpg"),
    title: t("auth.splash.reminder.title"),
    description: t("auth.splash.reminder.description"),
  },
  {
    key: "activity",
    image: require("./assets/promo/tend-activity.jpg"),
    title: t("auth.splash.activity.title"),
    description: t("auth.splash.activity.description"),
  },
] as const;

function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
}

type AuthMode = "splash" | "signIn" | "register";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppBootstrap />
    </SafeAreaProvider>
  );
}

function BootLoader() {
  return (
    <SafeAreaView style={styles.bootScreen}>
      <Image
        accessibilityLabel={t("app.logo")}
        resizeMode="contain"
        source={require("./assets/tend-logo.png")}
        style={styles.bootLogo}
      />
      <ActivityIndicator color={colors.primary} />
    </SafeAreaView>
  );
}

function AppBootstrap() {
  const [api, setApi] = useState<TendApi | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("splash");
  const [booting, setBooting] = useState(true);
  const [checkingSession, setCheckingSession] = useState(false);
  const [fontsLoaded, fontError] = useFonts(tendFonts);
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  const fontsReady = fontsLoaded || fontError !== null || fontsTimedOut;

  useEffect(() => {
    const timeoutId = setTimeout(() => setFontsTimedOut(true), 5_000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const client = await TendApi.load();
        if (!mounted) {
          return;
        }

        setApi(client);

        if (client.hasSession) {
          setCheckingSession(true);
          const restoredUser = await restoreSession(client);
          if (mounted) {
            setUser(restoredUser);
            if (restoredUser) {
              const status = await client.getOnboardingStatus().catch(() => ({ completed: true }));
              if (mounted) {
                setNeedsOnboarding(!status.completed);
              }
            }
            if (mounted) {
              setCheckingSession(false);
            }
          }
        }
      } catch {
        // Boot errors surface on the sign-in screen after startup.
      } finally {
        if (mounted) {
          setBooting(false);
        }
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignedIn(signedInUser: UserResponse, forceOnboarding = false) {
    setCheckingSession(true);
    setUser(signedInUser);
    try {
      if (forceOnboarding) {
        setNeedsOnboarding(true);
        return;
      }

      const status = await api?.getOnboardingStatus();
      setNeedsOnboarding(status ? !status.completed : false);
    } catch {
      setNeedsOnboarding(false);
    } finally {
      setCheckingSession(false);
    }
  }

  function handleOnboardingComplete() {
    setNeedsOnboarding(false);
  }

  if (booting || !api || !fontsReady || checkingSession) {
    return <BootLoader />;
  }

  if (!user) {
    if (authMode === "signIn") {
      return (
        <LoginScreen
          api={api}
          onCreateAccount={() => setAuthMode("register")}
          onSignedIn={handleSignedIn}
        />
      );
    }

    if (authMode === "register") {
      return (
        <RegisterScreen
          api={api}
          onSignIn={() => setAuthMode("signIn")}
          onSignedIn={(signedInUser) => handleSignedIn(signedInUser, true)}
        />
      );
    }

    return (
      <AuthSplashScreen
        onCreateAccount={() => setAuthMode("register")}
        onSignIn={() => setAuthMode("signIn")}
      />
    );
  }

  if (needsOnboarding) {
    return <OnboardingFlow api={api} onComplete={handleOnboardingComplete} />;
  }

  return (
    <AuthedApp
      api={api}
      user={user}
      onSignedOut={() => {
        setUser(null);
        setNeedsOnboarding(false);
        setAuthMode("splash");
      }}
    />
  );
}

function AuthSplashScreen({
  onCreateAccount,
  onSignIn,
}: {
  onCreateAccount: () => void;
  onSignIn: () => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<ScrollView>(null);
  const { height, width } = useWindowDimensions();
  const slideWidth = Math.max(1, width);
  const imageWidth = Math.min(width - spacing.md * 2, 430);
  const imageHeight = Math.min(imageWidth * 0.75, height * 0.38);
  const carouselHeight = imageHeight + 124;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((currentSlide) => {
        const nextSlide = (currentSlide + 1) % AUTH_PROMO_SLIDES.length;
        carouselRef.current?.scrollTo({ x: nextSlide * slideWidth, animated: true });
        return nextSlide;
      });
    }, 4_000);

    return () => clearInterval(intervalId);
  }, [slideWidth]);

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextSlide = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveSlide(Math.min(AUTH_PROMO_SLIDES.length - 1, Math.max(0, nextSlide)));
  }

  return (
    <SafeAreaView style={styles.authSplashScreen}>
      <View style={styles.splashHeader}>
        <Image
          accessibilityLabel={t("app.logo")}
          resizeMode="contain"
          source={require("./assets/tend-logo.png")}
          style={styles.splashLogo}
        />
      </View>

      <View style={styles.splashCarouselArea}>
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={[styles.splashCarousel, { height: carouselHeight }]}
        >
          {AUTH_PROMO_SLIDES.map((slide) => (
            <View key={slide.key} style={[styles.splashSlide, { width: slideWidth }]}>
              <Image
                resizeMode="contain"
                source={slide.image}
                style={[styles.splashImage, { height: imageHeight, width: imageWidth }]}
              />
              <View style={styles.splashCopyBlock}>
                <Text style={styles.splashTitle}>{slide.title}</Text>
                <Text style={styles.splashDescription}>{slide.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.splashFooter}>
        <View style={styles.splashDots} accessibilityRole="adjustable">
          {AUTH_PROMO_SLIDES.map((slide, index) => (
            <View
              key={slide.key}
              style={[styles.splashDot, index === activeSlide ? styles.splashDotActive : null]}
            />
          ))}
        </View>
        <PrimaryButton label={t("auth.signIn.button")} onPress={onSignIn} />
        <Pressable style={styles.authTextButton} onPress={onCreateAccount}>
          <Text style={styles.authTextButtonLabel}>{t("auth.createAccount.button")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function AuthedApp({
  api,
  user,
  onSignedOut,
}: {
  api: TendApi;
  user: UserResponse;
  onSignedOut: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  return (
    <SafeAreaView style={styles.app} edges={["top"]}>
      <AnimatedTabScreen activeTab={activeTab}>
        {(tab) => {
          if (tab === "home") {
            return <HomeScreen api={api} user={user} />;
          }

          if (tab === "activity") {
            return <ActivityScreen api={api} />;
          }

          if (tab === "add") {
            return <AddItemScreen api={api} onSaved={() => setActiveTab("home")} />;
          }

          if (tab === "availability") {
            return <AvailabilityScreen api={api} />;
          }

          return <SettingsScreen api={api} user={user} onSignedOut={onSignedOut} />;
        }}
      </AnimatedTabScreen>
      <BottomBar activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

function AnimatedTabScreen({
  activeTab,
  children,
}: {
  activeTab: TabKey;
  children: (tab: TabKey) => ReactNode;
}) {
  const [renderedTab, setRenderedTab] = useState(activeTab);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeTab === renderedTab) {
      return;
    }

    const direction = getTabSwitchDirection(renderedTab, activeTab);

    Animated.parallel([
      Animated.timing(opacity, {
        duration: 140,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        duration: 140,
        toValue: direction * -18,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRenderedTab(activeTab);
      translateX.setValue(direction * 18);
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          duration: 200,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [activeTab, opacity, renderedTab, translateX]);

  return (
    <Animated.View
      style={[
        styles.screenFrame,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      {children(renderedTab)}
    </Animated.View>
  );
}

function BottomBar({
  activeTab,
  onChange,
}: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {TAB_ITEMS.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        const isAdd = key === "add";

        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            android_ripple={{ color: "transparent" }}
            style={isAdd ? styles.addTabButton : styles.tabButton}
            onPress={() => onChange(key)}
          >
            {({ pressed }) => {
              const showPressedOverlay = pressed && !(active && !isAdd);

              return (
                <>
                  <View
                    style={[
                      isAdd ? styles.addTabIconWrap : styles.tabIconWrap,
                      active && !isAdd ? styles.tabIconWrapActive : null,
                      showPressedOverlay
                        ? isAdd
                          ? styles.addTabIconWrapPressed
                          : styles.tabIconWrapPressed
                        : null,
                    ]}
                  >
                    <Icon
                      size={isAdd ? 26 : 21}
                      color={isAdd ? colors.inverse : active ? colors.primary : colors.textMuted}
                    />
                  </View>
                  {!isAdd ? (
                    <Text
                      style={[styles.tabLabel, active ? styles.tabLabelActive : null]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  ) : null}
                </>
              );
            }}
          </Pressable>
        );
      })}
    </View>
  );
}

function AuthFormShell({
  children,
  description,
  footer,
  title,
}: {
  children: ReactNode;
  description?: string;
  footer: ReactNode;
  title: string;
}) {
  return (
    <SafeAreaView style={styles.authScreen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.onboardingContent}
      >
        <View style={styles.onboardingLogoWrap}>
          <Image
            accessibilityLabel={t("app.logo")}
            resizeMode="contain"
            source={require("./assets/tend-logo.png")}
            style={styles.splashLogo}
          />
        </View>
        <View style={styles.onboardingCard}>
          <Text style={styles.pageTitle}>{title}</Text>
          {description ? <Text style={styles.pageSubtitle}>{description}</Text> : null}
          <View style={styles.onboardingBody}>{children}</View>
          <View style={styles.onboardingFooter}>{footer}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LoginScreen({
  api,
  onCreateAccount,
  onSignedIn,
}: {
  api: TendApi;
  onCreateAccount: () => void;
  onSignedIn: (user: UserResponse) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState(api.baseUrl);
  const [savingBaseUrl, setSavingBaseUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showApiUrlField = isDevMode();

  async function saveApiBaseUrl() {
    setSavingBaseUrl(true);
    await api.setBaseUrl(apiBaseUrl.trim());
    setSavingBaseUrl(false);
  }

  async function signIn() {
    setSubmitting(true);
    setError(null);

    try {
      if (showApiUrlField) {
        await saveApiBaseUrl();
      }
      const body = await api.login(email.trim(), password);
      await onSignedIn(body.user);
    } catch (signInError) {
      setError(getErrorMessage(signInError, t("errors.signIn")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      description={t("auth.description")}
      footer={
        <>
          <PrimaryButton
            label={submitting || savingBaseUrl ? t("auth.signIn.loading") : t("auth.signIn.button")}
            disabled={
              submitting || savingBaseUrl || !email || !password || (showApiUrlField && !apiBaseUrl)
            }
            onPress={signIn}
          />
          <View style={styles.authSwitchRow}>
            <Text style={styles.authSwitchText}>{t("auth.signIn.prompt")} </Text>
            <Pressable onPress={onCreateAccount}>
              <Text style={styles.authSwitchLink}>{t("auth.createAccount.inlineLink")}</Text>
            </Pressable>
          </View>
        </>
      }
      title={t("auth.signIn.title")}
    >
      {showApiUrlField ? (
        <Field label={t("auth.apiUrl.label")} required>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={apiBaseUrl}
            onChangeText={setApiBaseUrl}
            style={styles.input}
            placeholder={t("auth.apiUrl.placeholder")}
            placeholderTextColor={colors.textSubtle}
          />
        </Field>
      ) : null}

      <Field label={t("auth.email.label")} required>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </Field>

      <Field label={t("auth.password.label")} required>
        <TextInput
          autoComplete="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </Field>

      {error ? <AlertBox message={error} tone="error" /> : null}
    </AuthFormShell>
  );
}

function RegisterScreen({
  api,
  onSignIn,
  onSignedIn,
}: {
  api: TendApi;
  onSignIn: () => void;
  onSignedIn: (user: UserResponse) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState(api.baseUrl);
  const [savingBaseUrl, setSavingBaseUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showApiUrlField = isDevMode();

  async function saveApiBaseUrl() {
    setSavingBaseUrl(true);
    await api.setBaseUrl(apiBaseUrl.trim());
    setSavingBaseUrl(false);
  }

  async function createAccount() {
    if (password !== confirmPassword) {
      setError(t("errors.passwordConfirm"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (showApiUrlField) {
        await saveApiBaseUrl();
      }
      const body = await api.register(displayName.trim(), email.trim(), password);
      await onSignedIn(body.user);
    } catch (registerError) {
      setError(getErrorMessage(registerError, t("errors.createAccount")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      description={t("auth.register.description")}
      footer={
        <>
          <PrimaryButton
            label={
              submitting || savingBaseUrl
                ? t("auth.createAccount.loading")
                : t("auth.createAccount.button")
            }
            disabled={
              submitting ||
              savingBaseUrl ||
              !displayName ||
              !email ||
              !password ||
              !confirmPassword ||
              (showApiUrlField && !apiBaseUrl)
            }
            onPress={createAccount}
          />
          <View style={styles.authSwitchRow}>
            <Text style={styles.authSwitchText}>{t("auth.createAccount.prompt")} </Text>
            <Pressable onPress={onSignIn}>
              <Text style={styles.authSwitchLink}>{t("auth.signIn.inlineLink")}</Text>
            </Pressable>
          </View>
        </>
      }
      title={t("auth.createAccount.title")}
    >
      {showApiUrlField ? (
        <Field label={t("auth.apiUrl.label")} required>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={apiBaseUrl}
            onChangeText={setApiBaseUrl}
            style={styles.input}
            placeholder={t("auth.apiUrl.placeholder")}
            placeholderTextColor={colors.textSubtle}
          />
        </Field>
      ) : null}

      <Field label={t("auth.displayName.label")} required>
        <TextInput
          autoCapitalize="words"
          autoComplete="name"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
        />
      </Field>

      <Field label={t("auth.email.label")} required>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </Field>

      <Field label={t("auth.password.label")} helper={t("auth.password.helper")} required>
        <TextInput
          autoComplete="new-password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </Field>

      <Field label={t("auth.passwordConfirm.label")} required>
        <TextInput
          autoComplete="new-password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
      </Field>

      {error ? <AlertBox message={error} tone="error" /> : null}
    </AuthFormShell>
  );
}

type OnboardingStepKey = "welcome" | "choose" | "preset" | "itemForm";
type ItemFormOrigin = "choose" | "preset";

interface ItemDraft {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string;
}

const ONBOARDING_TOTAL_STEPS = 4;
const ONBOARDING_STEP_NUMBERS: Record<OnboardingStepKey, number> = {
  welcome: 1,
  choose: 2,
  preset: 3,
  itemForm: 4,
};

function createDefaultDraft(todayDate: string): ItemDraft {
  return {
    name: "",
    type: "want",
    rhythmDays: 7,
    lifeArea: null,
    lastTendedDate: todayDate,
  };
}

function OnboardingFlow({ api, onComplete }: { api: TendApi; onComplete: () => void }) {
  const todayDate = useMemo(() => todayDateInputValue(), []);
  const [step, setStep] = useState<OnboardingStepKey>("welcome");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedArea, setSelectedArea] = useState<Exclude<LifeArea, "personal">>("household");
  const [itemFormOrigin, setItemFormOrigin] = useState<ItemFormOrigin>("choose");
  const [draft, setDraft] = useState<ItemDraft>(() => createDefaultDraft(todayDate));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function finishOnboarding() {
    setSubmitting(true);
    setError(null);

    try {
      await api.completeOnboarding();
      onComplete();
    } catch (finishError) {
      setError(getErrorMessage(finishError, t("onboarding.error.finish")));
      setSubmitting(false);
    }
  }

  function openCustomItemForm() {
    setDraft(createDefaultDraft(todayDate));
    setItemFormOrigin("choose");
    setError(null);
    setStep("itemForm");
  }

  function openPreset(preset: TendPreset) {
    setDraft({
      name: preset.name,
      type: preset.type,
      rhythmDays: preset.rhythmDays,
      lifeArea: preset.lifeArea,
      lastTendedDate: todayDate,
    });
    setItemFormOrigin("preset");
    setError(null);
    setStep("itemForm");
  }

  async function saveFirstItem(values: ItemDraft) {
    const validationErrors = validateItemForm(values, todayDate);

    if (validationErrors) {
      setError(
        validationErrors.name ??
          validationErrors.rhythmDays ??
          validationErrors.lastTendedDate ??
          t("errors.item.create"),
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createItem({
        name: values.name.trim(),
        type: values.type,
        rhythmDays: values.rhythmDays,
        lifeArea: values.lifeArea,
        lastTendedAt: dateInputToIso(values.lastTendedDate),
      });
      await api.completeOnboarding();
      onComplete();
    } catch (saveError) {
      setError(getErrorMessage(saveError, t("errors.item.create")));
      setSubmitting(false);
    }
  }

  if (step === "welcome") {
    const promoSlide = AUTH_PROMO_SLIDES[carouselIndex];

    return (
      <OnboardingShell
        step={step}
        title={carouselIndex === 0 ? t("onboarding.welcome.title") : promoSlide.title}
        description={promoSlide.description}
        footer={
          <>
            <PrimaryButton label={t("onboarding.addFirstItem")} onPress={() => setStep("choose")} />
            <TouchableOpacity
              disabled={submitting}
              style={[styles.onboardingGhostButton, submitting ? styles.buttonDisabled : null]}
              onPress={finishOnboarding}
            >
              <Text style={styles.onboardingGhostButtonText}>
                {submitting ? t("onboarding.skipping") : t("onboarding.skipToApp")}
              </Text>
            </TouchableOpacity>
          </>
        }
      >
        <PromoPager activeIndex={carouselIndex} onActiveIndexChange={setCarouselIndex} />
        {error ? <AlertBox message={error} tone="error" /> : null}
      </OnboardingShell>
    );
  }

  if (step === "choose") {
    return (
      <OnboardingShell
        step={step}
        title={t("onboarding.choose.title")}
        description={t("onboarding.choose.description")}
        footer={
          <>
            <PrimaryButton label={t("onboarding.addMyOwn")} onPress={openCustomItemForm} />
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setError(null);
                setStep("preset");
              }}
            >
              <Text style={styles.secondaryButtonText}>{t("onboarding.browseSuggestions")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={submitting}
              style={[styles.onboardingGhostButton, submitting ? styles.buttonDisabled : null]}
              onPress={finishOnboarding}
            >
              <Text style={styles.onboardingGhostButtonText}>
                {submitting ? t("onboarding.skipping") : t("onboarding.skipForNow")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.onboardingGhostButton}
              onPress={() => {
                setError(null);
                setStep("welcome");
              }}
            >
              <Text style={styles.onboardingGhostButtonText}>{t("onboarding.back")}</Text>
            </TouchableOpacity>
          </>
        }
      >
        {error ? <AlertBox message={error} tone="error" /> : null}
      </OnboardingShell>
    );
  }

  if (step === "preset") {
    return (
      <OnboardingShell
        step={step}
        title={t("onboarding.preset.title")}
        description={t("onboarding.preset.description")}
        footer={
          <TouchableOpacity
            style={styles.onboardingGhostButton}
            onPress={() => {
              setError(null);
              setStep("choose");
            }}
          >
            <Text style={styles.onboardingGhostButtonText}>{t("onboarding.back")}</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.onboardingChipRow}>
          {LIFE_AREA_ORDER.map((area) => (
            <Chip
              key={area}
              label={LIFE_AREA_LABELS[area]}
              selected={selectedArea === area}
              onPress={() => setSelectedArea(area)}
            />
          ))}
        </View>
        <View style={styles.onboardingPresetList}>
          {PRESETS_BY_AREA[selectedArea].map((preset) => (
            <TouchableOpacity
              key={preset.name}
              accessibilityRole="button"
              style={styles.onboardingPresetCard}
              onPress={() => openPreset(preset)}
            >
              <View style={styles.activityText}>
                <Text style={styles.cardTitle}>{preset.name}</Text>
                <Text style={styles.metaText}>
                  {preset.type === "must" ? t("type.must") : t("type.want")} · {preset.rhythmDays}d
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={step}
      title={t("onboarding.addFirstItem")}
      description={t("onboarding.form.description")}
      footer={
        <TouchableOpacity
          disabled={submitting}
          style={[styles.onboardingGhostButton, submitting ? styles.buttonDisabled : null]}
          onPress={() => {
            setError(null);
            setStep(itemFormOrigin === "preset" ? "preset" : "choose");
          }}
        >
          <Text style={styles.onboardingGhostButtonText}>{t("onboarding.back")}</Text>
        </TouchableOpacity>
      }
    >
      <FirstItemForm
        draft={draft}
        error={error}
        submitting={submitting}
        onChange={setDraft}
        onSubmit={saveFirstItem}
      />
    </OnboardingShell>
  );
}

function OnboardingShell({
  children,
  description,
  footer,
  step,
  title,
}: {
  children: ReactNode;
  description: string;
  footer: ReactNode;
  step: OnboardingStepKey;
  title: string;
}) {
  return (
    <SafeAreaView style={styles.authScreen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.onboardingContent}
      >
        <View style={styles.onboardingLogoWrap}>
          <Image
            accessibilityLabel={t("app.logo")}
            resizeMode="contain"
            source={require("./assets/tend-logo.png")}
            style={styles.splashLogo}
          />
        </View>
        <View style={styles.onboardingCard}>
          <View style={styles.onboardingStepHeader}>
            <Text style={styles.onboardingStepLabel}>
              {t("onboarding.step", {
                step: ONBOARDING_STEP_NUMBERS[step],
                total: ONBOARDING_TOTAL_STEPS,
              })}
            </Text>
            <View style={styles.onboardingStepDots}>
              {Array.from({ length: ONBOARDING_TOTAL_STEPS }, (_, i) => i + 1).map((stepNumber) => (
                <View
                  key={stepNumber}
                  style={[
                    styles.onboardingStepDot,
                    stepNumber <= ONBOARDING_STEP_NUMBERS[step]
                      ? styles.onboardingStepDotActive
                      : null,
                  ]}
                />
              ))}
            </View>
          </View>
          <Text style={styles.onboardingTitle}>{title}</Text>
          <Text style={styles.onboardingDescription}>{description}</Text>
          <View style={styles.onboardingBody}>{children}</View>
          <View style={styles.onboardingFooter}>{footer}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PromoPager({
  activeIndex,
  onActiveIndexChange,
}: {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  const carouselRef = useRef<ScrollView>(null);
  const { height, width } = useWindowDimensions();
  const slideWidth = Math.max(1, width - spacing.xxl * 2);
  const imageWidth = Math.min(slideWidth - spacing.lg * 2, 430);
  const imageHeight = Math.min(imageWidth * 0.75, height * 0.32);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = (activeIndex + 1) % AUTH_PROMO_SLIDES.length;
      carouselRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
      onActiveIndexChange(nextIndex);
    }, 4_000);

    return () => clearInterval(intervalId);
  }, [activeIndex, onActiveIndexChange, slideWidth]);

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    onActiveIndexChange(Math.min(AUTH_PROMO_SLIDES.length - 1, Math.max(0, nextIndex)));
  }

  return (
    <View>
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {AUTH_PROMO_SLIDES.map((slide) => (
          <View key={slide.key} style={[styles.onboardingPromoSlide, { width: slideWidth }]}>
            <Image
              resizeMode="contain"
              source={slide.image}
              style={{ height: imageHeight, width: imageWidth }}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.splashDots}>
        {AUTH_PROMO_SLIDES.map((slide, index) => (
          <View
            key={slide.key}
            style={[styles.splashDot, index === activeIndex ? styles.splashDotActive : null]}
          />
        ))}
      </View>
    </View>
  );
}

function FirstItemForm({
  draft,
  error,
  onChange,
  onSubmit,
  submitting,
}: {
  draft: ItemDraft;
  error: string | null;
  onChange: (draft: ItemDraft) => void;
  onSubmit: (draft: ItemDraft) => void;
  submitting: boolean;
}) {
  const todayDate = useMemo(() => todayDateInputValue(), []);

  function updateDraft(nextDraft: Partial<ItemDraft>) {
    onChange({ ...draft, ...nextDraft });
  }

  return (
    <View>
      <Field label={t("items.add.name.label")} required>
        <TextInput
          maxLength={ITEM_NAME_MAX_LENGTH}
          value={draft.name}
          onChangeText={(name) => updateDraft({ name })}
          style={styles.input}
        />
      </Field>

      <Field label={t("items.add.type.label")}>
        <TypeSelector value={draft.type} onChange={(type) => updateDraft({ type })} />
      </Field>

      <Field label={t("items.add.rhythm.label")}>
        <RhythmPicker
          value={draft.rhythmDays}
          onChange={(rhythmDays) => updateDraft({ rhythmDays })}
        />
      </Field>

      <Field label={t("items.add.lifeArea.label")}>
        <Text style={styles.fieldHelper}>{t("items.add.lifeArea.helper")}</Text>
        <LifeAreaPicker
          selected={draft.lifeArea}
          onChange={(lifeArea) => updateDraft({ lifeArea })}
          includeNone
        />
      </Field>

      <Field label={t("items.add.lastTended.label")}>
        <DatePickerField
          value={draft.lastTendedDate}
          onChange={(lastTendedDate) => updateDraft({ lastTendedDate })}
          maxDate={todayDate}
        />
      </Field>

      {error ? <AlertBox message={error} tone="error" /> : null}
      <PrimaryButton
        label={submitting ? t("onboarding.form.saving") : t("onboarding.form.save")}
        disabled={submitting}
        onPress={() => onSubmit(draft)}
      />
    </View>
  );
}

function HomeScreen({ api, user }: { api: TendApi; user: UserResponse }) {
  const {
    error,
    groups,
    items,
    lifeAreaFilter,
    loadItems,
    loading,
    markTended: markTendedItem,
    refreshing,
    setLifeAreaFilter,
  } = useHomeItems(api);

  const sectionDefaults = useMemo(
    () => getAttentionSectionDefaults(groups.needsAttention.length, groups.gettingStale.length),
    [groups.needsAttention.length, groups.gettingStale.length],
  );

  async function handleMarkTended(itemId: string) {
    try {
      await markTendedItem(itemId);
    } catch (tendError) {
      Alert.alert(t("errors.item.mark"), getErrorMessage(tendError, t("errors.retry")));
    }
  }

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={() => loadItems(true)}>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderRow}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>{t("home.title", { name: user.displayName })}</Text>
          </View>
          <Image
            accessibilityLabel={t("app.logo")}
            resizeMode="contain"
            source={require("./assets/tend-logo.png")}
            style={styles.homeLogo}
          />
        </View>
      </View>

      {error ? <AlertBox message={error} tone="error" /> : null}
      {loading ? <LoadingState label={t("common.loadingItems")} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title={t("home.empty.title")} body={t("home.empty.body")} />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <LifeAreaFilter selected={lifeAreaFilter} onChange={setLifeAreaFilter} />
          <AttentionSection
            key={sectionDefaults.needsAttention ? "needs-open" : "needs-closed"}
            title={t("sections.needsAttention")}
            count={groups.needsAttention.length}
            defaultOpen={sectionDefaults.needsAttention}
            emptyMessage={t("sections.empty.needsAttention")}
            items={groups.needsAttention}
            onTend={handleMarkTended}
          />
          <AttentionSection
            key={sectionDefaults.gettingStale ? "stale-open" : "stale-closed"}
            title={t("sections.gettingStale")}
            count={groups.gettingStale.length}
            defaultOpen={sectionDefaults.gettingStale}
            emptyMessage={t("sections.empty.gettingStale")}
            items={groups.gettingStale}
            onTend={handleMarkTended}
          />
          <AttentionSection
            title={t("sections.lookingGood")}
            count={groups.lookingGood.length}
            defaultOpen={sectionDefaults.lookingGood}
            emptyMessage={t("sections.empty.lookingGood")}
            items={groups.lookingGood}
            onTend={handleMarkTended}
            subdued
          />
        </>
      ) : null}
    </ScreenScroll>
  );
}

function ActivityScreen({ api }: { api: TendApi }) {
  const { deleteActivity, error, events, groups, loading } = useActivityEvents(api);

  function confirmDelete(eventId: string) {
    Alert.alert(t("activity.deleteConfirm.title"), t("activity.deleteConfirm.message"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.remove"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteActivity(eventId);
          } catch (deleteError) {
            Alert.alert(
              t("errors.activity.delete"),
              getErrorMessage(deleteError, t("errors.retry")),
            );
          }
        },
      },
    ]);
  }

  return (
    <ScreenScroll>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t("activity.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("activity.subtitle")}</Text>
      </View>

      {error ? <AlertBox message={error} tone="error" /> : null}
      {loading ? <LoadingState label={t("common.loadingActivity")} /> : null}
      {!loading && events.length === 0 ? (
        <EmptyState title={t("activity.empty.title")} body={t("activity.empty.body")} />
      ) : null}

      {groups.map((group) => (
        <View key={group.label} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{group.label}</Text>
            <Text style={styles.sectionCount}>{group.events.length}</Text>
          </View>
          <View style={styles.listStack}>
            {group.events.map((event) => (
              <View key={event.id} style={styles.activityRow}>
                <View style={styles.activityText}>
                  <Text style={styles.cardTitle}>{event.itemName}</Text>
                  <Text style={styles.metaText}>{formatEventDate(event.tendedAt)}</Text>
                </View>
                <IconButton
                  label={t("activity.removeEvent")}
                  onPress={() => confirmDelete(event.id)}
                >
                  <Trash2 size={18} color={colors.textMuted} />
                </IconButton>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScreenScroll>
  );
}

function AddItemScreen({ api, onSaved }: { api: TendApi; onSaved: () => void }) {
  const todayDate = useMemo(() => todayDateInputValue(), []);
  const [name, setName] = useState("");
  const [type, setType] = useState<TendItemType>("want");
  const [rhythmDays, setRhythmDays] = useState(7);
  const [lifeArea, setLifeArea] = useState<LifeArea | null>(null);
  const [lastTendedDate, setLastTendedDate] = useState(todayDate);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPresetName, setSelectedPresetName] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(preset: TendPreset) {
    setName(preset.name);
    setType(preset.type);
    setRhythmDays(preset.rhythmDays);
    setLifeArea(preset.lifeArea);
    setLastTendedDate(todayDate);
    setSelectedPresetName(preset.name);
    setError(null);
  }

  async function saveItem() {
    const validationErrors = validateItemForm(
      { name, type, rhythmDays, lifeArea, lastTendedDate },
      todayDate,
    );

    if (validationErrors) {
      setError(
        validationErrors.name ??
          validationErrors.rhythmDays ??
          validationErrors.lastTendedDate ??
          t("errors.item.create"),
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createItem({
        name: name.trim(),
        type,
        rhythmDays,
        lifeArea,
        lastTendedAt: dateInputToIso(lastTendedDate),
      });
      setName("");
      setType("want");
      setRhythmDays(7);
      setLifeArea(null);
      setLastTendedDate(todayDate);
      setSelectedPresetName(undefined);
      setShowSuggestions(false);
      onSaved();
    } catch (saveError) {
      setError(getErrorMessage(saveError, t("errors.item.create")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenScroll keyboardShouldPersistTaps="handled">
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderRow}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>{t("items.add.title")}</Text>
            <Text style={styles.pageSubtitle}>{t("items.add.subtitle")}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ expanded: showSuggestions }}
            style={styles.secondaryButtonSmall}
            onPress={() => setShowSuggestions((open) => !open)}
          >
            <Text style={styles.secondaryButtonText}>{t("items.add.suggestions.button")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSuggestions ? (
        <PresetSuggestions onSelect={applyPreset} selectedPresetName={selectedPresetName} />
      ) : null}

      <Field label={t("items.add.name.label")}>
        <TextInput
          maxLength={ITEM_NAME_MAX_LENGTH}
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder={t("items.add.name.placeholder")}
          placeholderTextColor={colors.textSubtle}
        />
      </Field>

      <Field label={t("items.add.type.label")}>
        <TypeSelector value={type} onChange={setType} />
      </Field>

      <Field label={t("items.add.rhythm.label")}>
        <RhythmPicker value={rhythmDays} onChange={setRhythmDays} />
      </Field>

      <Field label={t("items.add.lifeArea.label")}>
        <Text style={styles.fieldHelper}>{t("items.add.lifeArea.helper")}</Text>
        <LifeAreaPicker selected={lifeArea} onChange={setLifeArea} includeNone />
      </Field>

      <Field label={t("items.add.lastTended.label")}>
        <DatePickerField value={lastTendedDate} onChange={setLastTendedDate} maxDate={todayDate} />
      </Field>

      {error ? <AlertBox message={error} tone="error" /> : null}
      <PrimaryButton
        label={submitting ? t("items.add.saving") : t("items.add.save")}
        disabled={submitting}
        onPress={saveItem}
      />
    </ScreenScroll>
  );
}

function AvailabilityScreen({ api }: { api: TendApi }) {
  const {
    addWindow,
    byDay,
    error,
    hasChanges,
    loading,
    removeWindow,
    saveWindows,
    saving,
    success,
    updateWindow,
  } = useAvailabilityWindows(api);

  return (
    <ScreenScroll keyboardShouldPersistTaps="handled">
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t("availability.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("availability.subtitle")}</Text>
      </View>

      {error ? <AlertBox message={error} tone="error" /> : null}
      {success ? <AlertBox message={t("availability.saved")} tone="info" /> : null}
      {loading ? <LoadingState label={t("common.loadingAvailability")} /> : null}

      {WEEKDAYS.map((label, dayOfWeek) => {
        const dayWindows = byDay.get(dayOfWeek) ?? [];

        return (
          <View key={label} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.cardTitle}>{label}</Text>
              <TouchableOpacity
                style={styles.secondaryButtonSmall}
                onPress={() => addWindow(dayOfWeek)}
              >
                <Plus size={16} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>{t("availability.addWindow")}</Text>
              </TouchableOpacity>
            </View>

            {dayWindows.length === 0 ? (
              <Text style={styles.metaText}>{t("availability.noWindows")}</Text>
            ) : null}

            {dayWindows.map((window) => (
              <View key={window.key} style={styles.windowRow}>
                <TextInput
                  value={window.startTime}
                  onChangeText={(value) => updateWindow(window.key, { startTime: value })}
                  style={[styles.input, styles.timeInput]}
                  placeholder="18:00"
                  placeholderTextColor={colors.textSubtle}
                />
                <Text style={styles.toText}>{t("common.to")}</Text>
                <TextInput
                  value={window.endTime}
                  onChangeText={(value) => updateWindow(window.key, { endTime: value })}
                  style={[styles.input, styles.timeInput]}
                  placeholder="20:00"
                  placeholderTextColor={colors.textSubtle}
                />
                <IconButton
                  label={t("availability.removeWindow")}
                  onPress={() => removeWindow(window.key)}
                >
                  <Trash2 size={18} color={colors.textMuted} />
                </IconButton>
              </View>
            ))}
          </View>
        );
      })}

      <PrimaryButton
        label={saving ? t("availability.saving") : t("availability.save")}
        disabled={!hasChanges || saving}
        onPress={saveWindows}
      />
    </ScreenScroll>
  );
}

function SettingsScreen({
  api,
  user,
  onSignedOut,
}: {
  api: TendApi;
  user: UserResponse;
  onSignedOut: () => void;
}) {
  const [apiBaseUrl, setApiBaseUrl] = useState(api.baseUrl);
  const [saved, setSaved] = useState(false);
  const [timezone, setTimezone] = useState(deviceTimeZone());
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [timezoneSaving, setTimezoneSaving] = useState(false);
  const { pushToken, register, registering, scheduleReminder, statusMessage } =
    usePushNotifications(api);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const response = await api.getSettings();
        if (mounted) {
          setTimezone(response.settings.timezone);
        }
      } catch {
        if (mounted) {
          setSettingsError(t("errors.settings.load"));
        }
      }
    }

    loadSettings();
    return () => {
      mounted = false;
    };
  }, [api]);

  async function saveSettings() {
    await api.setBaseUrl(apiBaseUrl.trim());
    setSaved(true);
  }

  async function saveTimezone() {
    setTimezoneSaving(true);
    setSettingsMessage(null);
    setSettingsError(null);

    try {
      const response = await api.saveSettings({ timezone: timezone.trim() });
      setTimezone(response.settings.timezone);
      if (pushToken) {
        await scheduleReminder().catch(() => null);
      }
      setSettingsMessage(t("settings.timezone.saved"));
    } catch (saveError) {
      setSettingsError(getErrorMessage(saveError, t("errors.settings.save")));
    } finally {
      setTimezoneSaving(false);
    }
  }

  async function signOut() {
    await api.logout();
    onSignedOut();
  }

  return (
    <ScreenScroll>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>{t("settings.account.title")}</Text>
          <Text style={styles.pageSubtitle}>{t("settings.account.subtitle")}</Text>
        </View>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>{user.displayName}</Text>
        <Text style={styles.metaText}>{user.email}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>{t("settings.timezone.title")}</Text>
        <Text style={styles.metaText}>{t("settings.timezone.subtitle")}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={timezone}
          onChangeText={(value) => {
            setTimezone(value);
            setSettingsMessage(null);
            setSettingsError(null);
          }}
          style={styles.input}
          placeholder={t("settings.timezone.placeholder")}
          placeholderTextColor={colors.textSubtle}
        />
        {settingsMessage ? <AlertBox message={settingsMessage} tone="info" /> : null}
        {settingsError ? <AlertBox message={settingsError} tone="error" /> : null}
        <TouchableOpacity
          style={[styles.secondaryButton, timezoneSaving ? styles.buttonDisabled : null]}
          disabled={timezoneSaving}
          onPress={saveTimezone}
        >
          <Text style={styles.secondaryButtonText}>
            {timezoneSaving ? t("settings.timezone.saving") : t("settings.timezone.save")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>{t("settings.notifications.title")}</Text>
        <Text style={styles.metaText}>{t("settings.notifications.subtitle")}</Text>
        {pushToken ? (
          <Text style={styles.tokenText} numberOfLines={1}>
            {pushToken}
          </Text>
        ) : null}
        {statusMessage ? <AlertBox message={statusMessage} tone="info" /> : null}
        <TouchableOpacity
          style={[styles.secondaryButton, registering ? styles.buttonDisabled : null]}
          disabled={registering}
          onPress={register}
        >
          <Text style={styles.secondaryButtonText}>
            {registering ? t("settings.notifications.loading") : t("settings.notifications.button")}
          </Text>
        </TouchableOpacity>
      </View>

      {isDevMode() ? (
        <>
          <Field label={t("auth.apiUrl.label")}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              value={apiBaseUrl}
              onChangeText={(value) => {
                setApiBaseUrl(value);
                setSaved(false);
              }}
              style={styles.input}
              placeholder={t("auth.apiUrl.placeholder")}
              placeholderTextColor={colors.textSubtle}
            />
          </Field>

          {saved ? <AlertBox message={t("common.settingsSaved")} tone="info" /> : null}

          <PrimaryButton label={t("common.saveSettings")} onPress={saveSettings} />
        </>
      ) : null}
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <LogOut size={18} color={colors.textMuted} />
        <Text style={styles.signOutText}>{t("settings.signOut")}</Text>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

function AttentionSection({
  title,
  count,
  defaultOpen = true,
  emptyMessage = t("sections.empty.needsAttention"),
  items,
  onTend,
  subdued = false,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  emptyMessage?: string;
  items: ItemResponse[];
  onTend: (id: string) => void;
  subdued?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.sectionHeaderButton}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
        <View style={[styles.sectionChevronWrap, open ? styles.sectionChevronOpen : null]}>
          <ChevronDown size={16} color={colors.textMuted} />
        </View>
      </Pressable>
      {open ? (
        count > 0 ? (
          <View style={styles.listStack}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onTend={() => onTend(item.id)}
                subdued={subdued}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyInlineText}>{emptyMessage}</Text>
        )
      ) : null}
    </View>
  );
}

function ItemCard({
  item,
  onTend,
  subdued,
}: { item: ItemResponse; onTend: () => void; subdued?: boolean }) {
  const mustAttention = item.type === "must" && item.status === "needs_attention";

  return (
    <View
      style={[
        styles.itemCard,
        mustAttention ? styles.mustAttentionCard : null,
        subdued ? styles.subduedCard : null,
      ]}
    >
      <Text style={styles.itemTitle}>{item.name}</Text>
      <View style={styles.itemMetaRow}>
        <TypeBadge type={item.type} />
        <Text style={styles.relativeTimeText}>{relativeTendedLabel(item)}</Text>
      </View>
      <View style={styles.itemFooter}>
        <StatusBadge status={item.status} />
        <TouchableOpacity style={styles.markButton} onPress={onTend}>
          <Check size={16} color={colors.inverse} />
          <Text style={styles.markButtonText}>{t("items.markTended")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LifeAreaFilter({
  selected,
  onChange,
  defaultOpen = false,
}: {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={[styles.filterSection, !open ? styles.filterSectionCollapsed : null]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.filterToggle}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={styles.filterToggleText}>{lifeAreaFilterToggleLabel(selected)}</Text>
      </TouchableOpacity>

      {open ? (
        <View style={styles.chipRow}>
          <Chip
            label={t("common.all")}
            selected={selected === null}
            onPress={() => onChange(null)}
          />
          {LIFE_AREA_ORDER.map((area) => (
            <Chip
              key={area}
              label={LIFE_AREA_LABELS[area]}
              selected={selected === area}
              onPress={() => onChange(area)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function LifeAreaPicker({
  selected,
  onChange,
  includeNone = false,
}: {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
  includeNone?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {includeNone ? (
        <Chip
          label={t("common.none")}
          selected={selected === null}
          onPress={() => onChange(null)}
        />
      ) : null}
      {LIFE_AREA_ORDER.map((area) => (
        <Chip
          key={area}
          label={LIFE_AREA_LABELS[area]}
          selected={selected === area}
          onPress={() => onChange(area)}
        />
      ))}
    </View>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.segment, selected ? styles.segmentSelected : null]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.segmentText, selected ? styles.segmentTextSelected : null]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.chipSelected : null]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({
  children,
  helper,
  label,
  required = false,
}: {
  children: ReactNode;
  helper?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.fieldRequired}> *</Text> : null}
      </Text>
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
      {children}
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled ? styles.buttonDisabled : null]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function IconButton({
  label,
  onPress,
  disabled = false,
  children,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      disabled={disabled}
      style={[styles.iconButton, disabled ? styles.buttonDisabled : null]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}

function StatusBadge({ status }: { status: TendStatus }) {
  const style =
    status === "fresh"
      ? styles.statusFresh
      : status === "getting_stale"
        ? styles.statusStale
        : styles.statusAttention;

  return <Text style={[styles.badge, style]}>{statusLabel(status)}</Text>;
}

function TypeBadge({ type }: { type: TendItemType }) {
  return (
    <Text style={[styles.badge, type === "must" ? styles.typeMust : styles.typeWant]}>
      {type === "must" ? t("type.must") : t("type.want")}
    </Text>
  );
}

function AlertBox({ message, tone }: { message: string; tone: "error" | "info" }) {
  return (
    <View style={[styles.alertBox, tone === "error" ? styles.alertError : styles.alertInfo]}>
      <Text
        style={[styles.alertText, tone === "error" ? styles.alertErrorText : styles.alertInfoText]}
      >
        {message}
      </Text>
    </View>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyState}>
      <SlidersHorizontal size={22} color={colors.primary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function ScreenScroll({
  children,
  keyboardShouldPersistTaps,
  onRefresh,
  refreshing = false,
}: {
  children: ReactNode;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

function relativeTendedLabel(item: ItemResponse) {
  return formatRelativeFromDays(item.daysSinceLastTended);
}

function statusLabel(status: TendStatus) {
  if (status === "fresh") {
    return t("status.fresh");
  }

  if (status === "getting_stale") {
    return t("status.gettingStale");
  }

  return t("status.needsAttention");
}

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenFrame: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  centeredScreen: {
    alignItems: "center",
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: "center",
  },
  bootScreen: {
    alignItems: "center",
    backgroundColor: colors.bg,
    flex: 1,
    gap: spacing.xxl,
    justifyContent: "center",
  },
  bootLogo: {
    height: 44,
    width: 148,
  },
  bottomBar: {
    alignItems: "flex-end",
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 12,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-around",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
    minHeight: 54,
  },
  addTabButton: {
    alignItems: "center",
    flex: 1,
    minHeight: 54,
  },
  tabIconWrap: {
    alignItems: "center",
    borderRadius: radius.round,
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
    width: 40,
  },
  tabIconWrapActive: {
    backgroundColor: colors.primaryMuted,
  },
  tabIconWrapPressed: {
    backgroundColor: colors.muted,
  },
  addTabIconWrap: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: 54,
    justifyContent: "center",
    marginTop: -20,
    overflow: "hidden",
    width: 54,
  },
  addTabIconWrapPressed: {
    backgroundColor: colors.primaryPressed,
  },
  tabLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
  },
  pageHeader: {
    marginBottom: spacing.xl,
  },
  pageHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  homeLogo: {
    height: 24,
    width: 82,
  },
  pageTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
  },
  pageSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionHeaderButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 26,
  },
  sectionCount: {
    backgroundColor: colors.muted,
    borderRadius: radius.round,
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sectionChevronWrap: {
    marginLeft: "auto",
  },
  sectionChevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  listStack: {
    gap: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  mustAttentionCard: {
    backgroundColor: colors.mustBg,
    borderColor: "#d4b8ad",
  },
  subduedCard: {
    opacity: 0.85,
  },
  itemTitle: {
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    lineHeight: 24,
  },
  itemMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  relativeTimeText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    lineHeight: 22,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusFresh: {
    backgroundColor: colors.freshBg,
    color: colors.fresh,
  },
  statusStale: {
    backgroundColor: colors.staleBg,
    color: "#835f35",
  },
  statusAttention: {
    backgroundColor: colors.attentionBg,
    color: "#7f5143",
  },
  typeMust: {
    backgroundColor: colors.mustBg,
    color: colors.must,
  },
  typeWant: {
    backgroundColor: colors.wantBg,
    color: colors.want,
  },
  itemFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  markButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  markButtonText: {
    color: colors.inverse,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
  },
  emptyInlineText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterSectionCollapsed: {
    marginBottom: spacing.xl,
  },
  filterToggle: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterToggleText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
  },
  field: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
  },
  fieldHelper: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  fieldRequired: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputInset: {
    marginTop: spacing.sm,
    width: 120,
  },
  segmented: {
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    flexDirection: "row",
    padding: spacing.xs,
  },
  segment: {
    alignItems: "center",
    borderRadius: radius.sm,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  segmentSelected: {
    backgroundColor: colors.card,
  },
  segmentText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
  },
  segmentTextSelected: {
    color: colors.primary,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.inverse,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
  },
  secondaryButtonSmall: {
    alignItems: "center",
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    justifyContent: "center",
    marginTop: spacing.md,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  alertBox: {
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  alertError: {
    backgroundColor: colors.errorBg,
  },
  alertInfo: {
    backgroundColor: colors.primaryMuted,
  },
  alertText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  alertErrorText: {
    color: colors.error,
  },
  alertInfoText: {
    color: colors.primary,
  },
  emptyState: {
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemibold,
    fontSize: 18,
  },
  emptyBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  loadingState: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  activityRow: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  activityText: {
    flex: 1,
  },
  metaText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  dayHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  windowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  timeInput: {
    flex: 1,
  },
  toText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  tokenText: {
    backgroundColor: colors.subtle,
    borderRadius: radius.md,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  signOutButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.xl,
    minHeight: 48,
  },
  signOutText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
  },
  authScreen: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  authSplashScreen: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  splashHeader: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  splashLogo: {
    height: 38,
    width: 132,
  },
  splashCarouselArea: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  splashCarousel: {
    flexGrow: 0,
    flexShrink: 0,
  },
  splashSlide: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  splashImage: {
    borderRadius: radius.md,
  },
  splashCopyBlock: {
    marginTop: spacing.md,
    minHeight: 96,
    width: "100%",
  },
  splashTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 25,
    lineHeight: 31,
    textAlign: "center",
  },
  splashDescription: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  splashFooter: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
  },
  splashDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  splashDot: {
    backgroundColor: colors.border,
    borderRadius: radius.round,
    height: 7,
    width: 7,
  },
  splashDotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },
  authSwitchRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    rowGap: spacing.xs,
  },
  authSwitchText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  authSwitchLink: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 20,
  },
  authTextButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  authTextButtonLabel: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
  },
  onboardingContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  onboardingLogoWrap: {
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  onboardingCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  onboardingStepHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  onboardingStepLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  onboardingStepDots: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  onboardingStepDot: {
    backgroundColor: colors.border,
    borderRadius: radius.round,
    height: 7,
    width: 18,
  },
  onboardingStepDotActive: {
    backgroundColor: colors.primary,
  },
  onboardingTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
  },
  onboardingDescription: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  onboardingBody: {
    marginTop: spacing.xl,
  },
  onboardingFooter: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  onboardingGhostButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  onboardingGhostButtonText: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
  },
  onboardingPromoSlide: {
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  onboardingPresetList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  onboardingPresetCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
