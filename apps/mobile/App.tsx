import {
  LIFE_AREA_ORDER,
  REMINDER_POLL_MS,
  WEEKDAYS,
  dateInputToIso,
  isoToDateInputValue,
  todayDateInputValue,
} from "@/constants";
import { tendFonts } from "@/fonts";
import { colors, fonts, radius, spacing } from "@/theme";
import type { ActivityEntryResponse, ItemResponse, ReminderResponse, UserResponse } from "@/types";
import { getAttentionSectionDefaults } from "@/utils/homeGroups";
import { refreshHomeData } from "@/utils/homeRefresh";
import { keyboardAvoidingBehavior } from "@/utils/keyboardAvoidance";
import { formatRelativeFromDays } from "@/utils/relativeTime";
import { reminderItemIdsKey, selectReminderBannerItems } from "@/utils/reminderBanner";
import { type TabKey, getTabTransition, resolveHardwareBackAction } from "@/utils/tabTransition";
import { TendApi } from "@api/tendApi";
import { DatePickerField } from "@components/date-picker-field";
import { ItemForm } from "@components/item-form";
import { Chip } from "@components/life-area-picker";
import { PresetSuggestions } from "@components/preset-suggestions";
import { PrimaryButton } from "@components/primary-button";
import { ActivitySkeleton, AvailabilitySkeleton, HomeItemsSkeleton } from "@components/skeleton";
import { TimeSelect } from "@components/time-select";
import { useActivityEvents } from "@hooks/useActivityEvents";
import { useAvailabilityWindows } from "@hooks/useAvailabilityWindows";
import { useHomeItems } from "@hooks/useHomeItems";
import { usePushNotifications } from "@hooks/usePushNotifications";
import {
  LOCALE_OPTIONS,
  LOCALE_STORAGE_KEY,
  type Locale,
  getLocale,
  isLocale,
  lifeAreaFilterToggleLabel,
  lifeAreaLabel,
  setLocale,
  t,
} from "@i18n";
import { PRESETS_BY_AREA } from "@tend/domain";
import {
  type LifeArea,
  type TendItemType,
  type TendPreset,
  type TendStatus,
  parseTimeToMinutes,
} from "@tend/domain";
import { isDevMode } from "@utils/devMode";
import { itemFormValuesFromItem } from "@utils/itemFormValues";
import { getErrorMessage } from "@utils/networkError";
import { restoreSession } from "@utils/sessionRestore";
import { storage } from "@utils/storage";
import { timeOptionsAfter } from "@utils/timeOptions";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  CalendarClock,
  Check,
  ChevronDown,
  Home,
  LogOut,
  Pencil,
  Plus,
  Settings,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react-native";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

function tabItems() {
  return [
    { key: "home", label: t("nav.home"), Icon: Home },
    { key: "activity", label: t("nav.activity"), Icon: Activity },
    { key: "add", label: t("nav.add"), Icon: Plus },
    { key: "availability", label: t("nav.availability"), Icon: CalendarClock },
    { key: "settings", label: t("nav.settings"), Icon: Settings },
  ] as const;
}

function authPromoSlides() {
  return [
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
      key: "friend",
      image: require("./assets/promo/tend-friend-promo.png"),
      title: t("auth.splash.friend.title"),
      description: t("auth.splash.friend.description"),
    },
    {
      key: "activity",
      image: require("./assets/promo/tend-activity.jpg"),
      title: t("auth.splash.activity.title"),
      description: t("auth.splash.activity.description"),
    },
  ] as const;
}

const TIMEZONE_OPTIONS = [
  "UTC",
  "Europe/Belgrade",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
}

function freeTimePhrase(now: Date) {
  const hour = now.getHours();
  if (hour < 12) {
    return t("notifications.headline.morning");
  }

  if (hour < 17) {
    return t("notifications.headline.afternoon");
  }

  return t("notifications.headline.evening");
}

type FreeTimeHeadlineBuilder = (timePhrase: string, plural: boolean) => string;

const FREE_TIME_HEADLINE_VARIANTS: FreeTimeHeadlineBuilder[] = [
  (_timePhrase, plural) =>
    plural ? t("notifications.headline.upForItPlural") : t("notifications.headline.upForItSingle"),
  (timePhrase) => t("notifications.headline.quietMoment", { time: timePhrase }),
  (_timePhrase, plural) =>
    plural
      ? t("notifications.headline.whenMomentPlural")
      : t("notifications.headline.whenMomentSingle"),
  (timePhrase, plural) =>
    plural
      ? t("notifications.headline.spareMomentPlural", { time: timePhrase })
      : t("notifications.headline.spareMomentSingle", { time: timePhrase }),
];

function pickFreeTimeHeadlineVariantIndex(now: Date, variantCount: number) {
  const dayNumber = Math.floor(now.getTime() / 86_400_000);
  return ((dayNumber % variantCount) + variantCount) % variantCount;
}

function reminderBannerHeadline(reminderCount: number, now = new Date()) {
  const variantIndex = pickFreeTimeHeadlineVariantIndex(now, FREE_TIME_HEADLINE_VARIANTS.length);
  return FREE_TIME_HEADLINE_VARIANTS[variantIndex](freeTimePhrase(now), reminderCount > 1);
}

type AuthMode = "splash" | "signIn" | "register";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <AppBootstrap />
      </View>
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
  const [locale, setLocaleState] = useState<Locale>(getLocale());
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
        const savedLocale = await storage.getString(LOCALE_STORAGE_KEY);
        if (isLocale(savedLocale)) {
          setLocale(savedLocale);
          if (mounted) {
            setLocaleState(savedLocale);
          }
        }

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
      locale={locale}
      onLocaleChange={(nextLocale) => {
        setLocale(nextLocale);
        setLocaleState(nextLocale);
        void storage.setString(LOCALE_STORAGE_KEY, nextLocale);
      }}
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
  const slides = authPromoSlides();
  const { height, width } = useWindowDimensions();
  const slideWidth = Math.max(1, width);
  const imageWidth = Math.min(width - spacing.md * 2, 430);
  const imageHeight = Math.min(imageWidth * 0.75, height * 0.38);
  const carouselHeight = imageHeight + 124;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((currentSlide) => {
        const nextSlide = (currentSlide + 1) % slides.length;
        carouselRef.current?.scrollTo({ x: nextSlide * slideWidth, animated: true });
        return nextSlide;
      });
    }, 4_000);

    return () => clearInterval(intervalId);
  }, [slideWidth, slides.length]);

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextSlide = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveSlide(Math.min(slides.length - 1, Math.max(0, nextSlide)));
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
          {slides.map((slide) => (
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
          {slides.map((slide, index) => (
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
  locale,
  onLocaleChange,
  user,
  onSignedOut,
}: {
  api: TendApi;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  user: UserResponse;
  onSignedOut: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      const action = resolveHardwareBackAction(activeTab);

      if (action.nextTab) {
        setActiveTab(action.nextTab);
      }

      return action.consume;
    });

    return () => subscription.remove();
  }, [activeTab]);

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

          return (
            <SettingsScreen
              api={api}
              locale={locale}
              onLocaleChange={onLocaleChange}
              user={user}
              onSignedOut={onSignedOut}
            />
          );
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
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeTab === renderedTab) {
      return;
    }

    const transition = getTabTransition(renderedTab, activeTab);
    const translate = transition.axis === "x" ? translateX : translateY;
    const idleTranslate = transition.axis === "x" ? translateY : translateX;
    idleTranslate.setValue(0);

    Animated.parallel([
      Animated.timing(opacity, {
        duration: 140,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        duration: 140,
        toValue: transition.exitOffset,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRenderedTab(activeTab);
      translate.setValue(transition.enterOffset);
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          duration: 200,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [activeTab, opacity, renderedTab, translateX, translateY]);

  return (
    <Animated.View
      style={[
        styles.screenFrame,
        {
          opacity,
          transform: [{ translateX }, { translateY }],
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
  const items = tabItems();

  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {items.map(({ key, label, Icon }) => {
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
      <KeyboardAwareScreen>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.onboardingContent, styles.keyboardAwareScrollContent]}
          style={styles.screen}
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
      </KeyboardAwareScreen>
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
  sharedWithEmail: string;
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
    sharedWithEmail: "",
  };
}

function OnboardingFlow({ api, onComplete }: { api: TendApi; onComplete: () => void }) {
  const todayDate = useMemo(() => todayDateInputValue(), []);
  const [step, setStep] = useState<OnboardingStepKey>("welcome");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const promoSlides = authPromoSlides();
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
      sharedWithEmail: "",
    });
    setItemFormOrigin("preset");
    setError(null);
    setStep("itemForm");
  }

  async function saveFirstItem(values: ItemDraft) {
    setSubmitting(true);
    setError(null);

    try {
      await api.createItem({
        name: values.name.trim(),
        type: values.type,
        rhythmDays: values.rhythmDays,
        lifeArea: values.lifeArea,
        lastTendedAt: dateInputToIso(values.lastTendedDate),
        sharedWithEmail: values.sharedWithEmail.trim() || null,
      });
      await api.completeOnboarding();
      onComplete();
    } catch (saveError) {
      setError(getErrorMessage(saveError, t("errors.item.create")));
      setSubmitting(false);
    }
  }

  if (step === "welcome") {
    const promoSlide = promoSlides[carouselIndex];

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
              label={lifeAreaLabel(area)}
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
      <ItemForm
        values={draft}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onSubmit={saveFirstItem}
        submitLabel={t("onboarding.form.save")}
        submittingLabel={t("onboarding.form.saving")}
        submitting={submitting}
        formError={error}
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
      <KeyboardAwareScreen>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.onboardingContent, styles.keyboardAwareScrollContent]}
          style={styles.screen}
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
                {Array.from({ length: ONBOARDING_TOTAL_STEPS }, (_, i) => i + 1).map(
                  (stepNumber) => (
                    <View
                      key={stepNumber}
                      style={[
                        styles.onboardingStepDot,
                        stepNumber <= ONBOARDING_STEP_NUMBERS[step]
                          ? styles.onboardingStepDotActive
                          : null,
                      ]}
                    />
                  ),
                )}
              </View>
            </View>
            <Text style={styles.onboardingTitle}>{title}</Text>
            <Text style={styles.onboardingDescription}>{description}</Text>
            <View style={styles.onboardingBody}>{children}</View>
            <View style={styles.onboardingFooter}>{footer}</View>
          </View>
        </ScrollView>
      </KeyboardAwareScreen>
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
  const slides = authPromoSlides();
  const { height, width } = useWindowDimensions();
  const slideWidth = Math.max(1, width - spacing.xxl * 2);
  const imageWidth = Math.min(slideWidth - spacing.lg * 2, 430);
  const imageHeight = Math.min(imageWidth * 0.75, height * 0.32);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      carouselRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
      onActiveIndexChange(nextIndex);
    }, 4_000);

    return () => clearInterval(intervalId);
  }, [activeIndex, onActiveIndexChange, slideWidth, slides.length]);

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    onActiveIndexChange(Math.min(slides.length - 1, Math.max(0, nextIndex)));
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
        {slides.map((slide) => (
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
        {slides.map((slide, index) => (
          <View
            key={slide.key}
            style={[styles.splashDot, index === activeIndex ? styles.splashDotActive : null]}
          />
        ))}
      </View>
    </View>
  );
}

function HomeScreen({ api, user }: { api: TendApi; user: UserResponse }) {
  const [bannerReminders, setBannerReminders] = useState<ReminderResponse[]>([]);
  const [editingItem, setEditingItem] = useState<ItemResponse | null>(null);
  const bannerReminderSetKeyRef = useRef("");
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

  const updateBannerReminders = useCallback((surfaceNow: ReminderResponse[]) => {
    const selectedReminders = selectReminderBannerItems(surfaceNow);
    const nextKey = reminderItemIdsKey(selectedReminders);

    if (nextKey === bannerReminderSetKeyRef.current) {
      return;
    }

    bannerReminderSetKeyRef.current = nextKey;
    setBannerReminders(selectedReminders);
  }, []);

  const fetchReminders = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        const reminders = await api.listReminders();
        if (options?.force) {
          bannerReminderSetKeyRef.current = "";
        }
        updateBannerReminders(reminders.surfaceNow);
      } catch {
        // Home still has the item list if reminder surfacing is temporarily unavailable.
      }
    },
    [api, updateBannerReminders],
  );

  useEffect(() => {
    fetchReminders();

    const interval = setInterval(fetchReminders, REMINDER_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  async function handleMarkTended(itemId: string) {
    try {
      await markTendedItem(itemId);
      await fetchReminders();
    } catch (tendError) {
      Alert.alert(t("errors.item.mark"), getErrorMessage(tendError, t("errors.retry")));
    }
  }

  async function handleRefresh() {
    await refreshHomeData(loadItems, fetchReminders);
  }

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={handleRefresh}>
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
      {bannerReminders.length > 0 ? (
        <ReminderBanner reminders={bannerReminders} onTend={handleMarkTended} />
      ) : null}
      {loading ? <HomeItemsSkeleton label={t("common.loadingItems")} /> : null}

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
            onEdit={setEditingItem}
            onTend={handleMarkTended}
          />
          <AttentionSection
            key={sectionDefaults.gettingStale ? "stale-open" : "stale-closed"}
            title={t("sections.gettingStale")}
            count={groups.gettingStale.length}
            defaultOpen={sectionDefaults.gettingStale}
            emptyMessage={t("sections.empty.gettingStale")}
            items={groups.gettingStale}
            onEdit={setEditingItem}
            onTend={handleMarkTended}
          />
          <AttentionSection
            title={t("sections.lookingGood")}
            count={groups.lookingGood.length}
            defaultOpen={sectionDefaults.lookingGood}
            emptyMessage={t("sections.empty.lookingGood")}
            items={groups.lookingGood}
            onEdit={setEditingItem}
            onTend={handleMarkTended}
            subdued
          />
        </>
      ) : null}

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={editingItem !== null}
        onRequestClose={() => setEditingItem(null)}
      >
        {editingItem ? (
          <EditItemScreen
            api={api}
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSaved={async () => {
              setEditingItem(null);
              await loadItems();
              await fetchReminders();
            }}
            onDeleted={async () => {
              setEditingItem(null);
              await loadItems();
              await fetchReminders();
            }}
          />
        ) : null}
      </Modal>
    </ScreenScroll>
  );
}

function ActivityScreen({ api }: { api: TendApi }) {
  const { deleteActivity, error, events, groups, loading, updateActivity } = useActivityEvents(api);

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
      {loading ? <ActivitySkeleton label={t("common.loadingActivity")} /> : null}
      {!loading && events.length === 0 ? (
        <EmptyState title={t("activity.empty.title")} body={t("activity.empty.body")} />
      ) : null}

      {!loading
        ? groups.map((group) => (
            <View key={group.label} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{group.label}</Text>
                <Text style={styles.sectionCount}>{group.events.length}</Text>
              </View>
              <View style={styles.listStack}>
                {group.events.map((event) => (
                  <ActivityEventRow
                    key={event.id}
                    event={event}
                    onDelete={() => confirmDelete(event.id)}
                    onUpdate={updateActivity}
                  />
                ))}
              </View>
            </View>
          ))
        : null}
    </ScreenScroll>
  );
}

function ActivityEventRow({
  event,
  onDelete,
  onUpdate,
}: {
  event: ActivityEntryResponse;
  onDelete: () => void;
  onUpdate: (eventId: string, tendedAt: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(isoToDateInputValue(event.tendedAt));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDateValue(isoToDateInputValue(event.tendedAt));
    }
  }, [editing, event.tendedAt]);

  async function handleSave() {
    setSaving(true);

    try {
      await onUpdate(event.id, dateInputToIso(dateValue));
      setEditing(false);
    } catch (updateError) {
      Alert.alert(t("errors.activity.update"), getErrorMessage(updateError, t("errors.retry")));
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDateValue(isoToDateInputValue(event.tendedAt));
    setEditing(false);
  }

  if (editing) {
    return (
      <View style={[styles.activityRow, styles.activityEditRow]}>
        <View style={styles.activityEditHeader}>
          <Text style={styles.cardTitle}>{event.itemName}</Text>
          <Text style={styles.metaText}>{formatEventDate(event.tendedAt)}</Text>
        </View>
        <Field label={t("activity.tendedOn")}>
          <DatePickerField
            value={dateValue}
            onChange={setDateValue}
            maxDate={todayDateInputValue()}
            accessibilityLabel={t("activity.tendedOn")}
          />
        </Field>
        <View style={styles.activityEditActions}>
          <TouchableOpacity
            disabled={saving}
            style={[styles.secondaryButtonSmall, saving ? styles.buttonDisabled : null]}
            onPress={handleCancel}
          >
            <Text style={styles.secondaryButtonText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={saving}
            style={[styles.activitySaveButton, saving ? styles.buttonDisabled : null]}
            onPress={handleSave}
          >
            {saving ? <ActivityIndicator size="small" color={colors.inverse} /> : null}
            <Text style={styles.activitySaveButtonText}>
              {saving ? t("common.saving") : t("activity.saveDate")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.activityRow}>
      <View style={styles.activityText}>
        <Text style={styles.cardTitle}>{event.itemName}</Text>
        <Text style={styles.metaText}>{formatEventDate(event.tendedAt)}</Text>
      </View>
      <View style={styles.activityActions}>
        <IconButton label={t("activity.editEvent")} onPress={() => setEditing(true)}>
          <Pencil size={18} color={colors.textMuted} />
        </IconButton>
        <IconButton label={t("activity.removeEvent")} onPress={onDelete}>
          <Trash2 size={18} color={colors.textMuted} />
        </IconButton>
      </View>
    </View>
  );
}

function ReminderBanner({
  reminders,
  onTend,
}: {
  reminders: ReminderResponse[];
  onTend: (id: string) => void;
}) {
  const hasMust = reminders.some((reminder) => reminder.type === "must");

  if (reminders.length === 0) {
    return null;
  }

  return (
    <View style={[styles.reminderBanner, hasMust ? styles.reminderBannerMust : null]}>
      <Text style={styles.reminderBannerTitle}>{reminderBannerHeadline(reminders.length)}</Text>
      <View style={styles.reminderList}>
        {reminders.map((reminder) => (
          <View key={reminder.itemId} style={styles.reminderRow}>
            <View style={styles.reminderText}>
              <Text style={styles.reminderName}>{reminder.name}</Text>
            </View>
            <View style={styles.reminderActions}>
              <TypeBadge type={reminder.type} />
              {reminder.sharedWith ? (
                <SharedWithBadge displayName={reminder.sharedWith.displayName} />
              ) : null}
              <TouchableOpacity
                style={styles.markButtonCompact}
                onPress={() => onTend(reminder.itemId)}
              >
                <Check size={15} color={colors.inverse} />
                <Text style={styles.markButtonText}>{t("items.markTended")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AddItemScreen({ api, onSaved }: { api: TendApi; onSaved: () => void }) {
  const todayDate = useMemo(() => todayDateInputValue(), []);
  const [values, setValues] = useState({
    name: "",
    type: "want" as TendItemType,
    rhythmDays: 7,
    lifeArea: null as LifeArea | null,
    lastTendedDate: todayDate,
    sharedWithEmail: "",
  });
  const [formKey, setFormKey] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPresetName, setSelectedPresetName] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(preset: TendPreset) {
    setValues({
      name: preset.name,
      type: preset.type,
      rhythmDays: preset.rhythmDays,
      lifeArea: preset.lifeArea,
      lastTendedDate: todayDate,
      sharedWithEmail: "",
    });
    setSelectedPresetName(preset.name);
    setError(null);
    setFormKey((current) => current + 1);
  }

  async function saveItem(formValues: typeof values) {
    setSubmitting(true);
    setError(null);

    try {
      await api.createItem({
        name: formValues.name.trim(),
        type: formValues.type,
        rhythmDays: formValues.rhythmDays,
        lifeArea: formValues.lifeArea,
        lastTendedAt: dateInputToIso(formValues.lastTendedDate),
        sharedWithEmail: formValues.sharedWithEmail.trim() || null,
      });
      setValues({
        name: "",
        type: "want",
        rhythmDays: 7,
        lifeArea: null,
        lastTendedDate: todayDate,
        sharedWithEmail: "",
      });
      setSelectedPresetName(undefined);
      setShowSuggestions(false);
      setFormKey((current) => current + 1);
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

      <ItemForm
        key={formKey}
        values={values}
        onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
        onSubmit={saveItem}
        submitLabel={t("items.add.save")}
        submittingLabel={t("items.add.saving")}
        submitting={submitting}
        formError={error}
      />
    </ScreenScroll>
  );
}

function EditItemScreen({
  api,
  item,
  onClose,
  onDeleted,
  onSaved,
}: {
  api: TendApi;
  item: ItemResponse;
  onClose: () => void;
  onDeleted: () => void | Promise<void>;
  onSaved: () => void | Promise<void>;
}) {
  const initialValues = useMemo(() => itemFormValuesFromItem(item), [item]);
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveItem(formValues: typeof values) {
    setSubmitting(true);
    setError(null);

    try {
      await api.updateItem(item.id, {
        name: formValues.name.trim(),
        type: formValues.type,
        rhythmDays: formValues.rhythmDays,
        lifeArea: formValues.lifeArea,
        lastTendedAt: dateInputToIso(formValues.lastTendedDate),
        sharedWithEmail: formValues.sharedWithEmail.trim() || null,
      });
      await onSaved();
    } catch (saveError) {
      setError(getErrorMessage(saveError, t("errors.item.update")));
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t("items.delete.confirmTitle"), t("items.delete.description"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("items.delete.confirm"),
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          setError(null);

          try {
            await api.deleteItem(item.id);
            await onDeleted();
          } catch (deleteError) {
            setError(getErrorMessage(deleteError, t("errors.item.delete")));
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.modalScreen}>
      <ScreenScroll keyboardShouldPersistTaps="handled">
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderRow}>
            <View style={styles.pageHeaderText}>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={styles.modalBackButton}
              >
                <Text style={styles.onboardingGhostButtonText}>{t("onboarding.back")}</Text>
              </Pressable>
              <Text style={styles.pageTitle}>{t("items.edit.title")}</Text>
              <Text style={styles.pageSubtitle}>{t("items.edit.subtitle")}</Text>
            </View>
          </View>
        </View>

        <ItemForm
          key={item.id}
          values={values}
          onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
          onSubmit={saveItem}
          submitLabel={t("items.edit.save")}
          submittingLabel={t("items.edit.saving")}
          submitting={submitting}
          formError={error}
        />
        {item.canDelete ? (
          <View style={styles.deleteItemSection}>
            <Text style={styles.deleteItemHelp}>{t("items.delete.description")}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={submitting || deleting}
              style={[
                styles.deleteItemButton,
                submitting || deleting ? styles.buttonDisabled : null,
              ]}
              onPress={confirmDelete}
            >
              {deleting ? <ActivityIndicator size="small" color={colors.error} /> : null}
              <Text style={styles.deleteItemButtonText}>
                {deleting ? t("items.delete.deleting") : t("items.delete.action")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScreenScroll>
    </SafeAreaView>
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

      {loading ? <AvailabilitySkeleton label={t("common.loadingAvailability")} /> : null}

      {!loading
        ? WEEKDAYS.map((labelKey, dayOfWeek) => {
            const label = t(labelKey);
            const dayWindows = byDay.get(dayOfWeek) ?? [];

            return (
              <View key={labelKey} style={styles.dayCard}>
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
                    <TimeSelect
                      value={window.startTime}
                      accessibilityLabel={t("availability.startTime")}
                      onChange={(startTime) => {
                        const endAfterStart = timeOptionsAfter(startTime);
                        const endTime =
                          parseTimeToMinutes(window.endTime) <= parseTimeToMinutes(startTime)
                            ? (endAfterStart[0] ?? window.endTime)
                            : window.endTime;

                        updateWindow(window.key, { startTime, endTime });
                      }}
                    />
                    <Text style={styles.toText}>{t("common.to")}</Text>
                    <TimeSelect
                      value={window.endTime}
                      afterTime={window.startTime}
                      accessibilityLabel={t("availability.endTime")}
                      onChange={(endTime) => updateWindow(window.key, { endTime })}
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
          })
        : null}

      {!loading && error ? <AlertBox message={error} tone="error" /> : null}
      {!loading && success ? <AlertBox message={t("availability.saved")} tone="info" /> : null}

      {!loading ? (
        <PrimaryButton
          label={saving ? t("availability.saving") : t("availability.save")}
          disabled={!hasChanges || saving}
          onPress={saveWindows}
        />
      ) : null}
    </ScreenScroll>
  );
}

function SettingsScreen({
  api,
  locale,
  onLocaleChange,
  user,
  onSignedOut,
}: {
  api: TendApi;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  user: UserResponse;
  onSignedOut: () => void;
}) {
  const [apiBaseUrl, setApiBaseUrl] = useState(api.baseUrl);
  const [saved, setSaved] = useState(false);
  const [timezone, setTimezone] = useState(deviceTimeZone());
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [timezoneSaving, setTimezoneSaving] = useState(false);
  const { disable, pushToken, register, registering, statusMessage } = usePushNotifications(api);

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
        <Text style={styles.cardTitle}>{t("settings.language.title")}</Text>
        <Text style={styles.metaText}>{t("settings.language.subtitle")}</Text>
        <View style={styles.languageSwitch} accessibilityLabel={t("language.label")}>
          {LOCALE_OPTIONS.map((option) => {
            const selected = locale === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.languageSwitchOption,
                  selected ? styles.languageSwitchSelected : null,
                ]}
                onPress={() => onLocaleChange(option.value)}
              >
                <Text
                  style={[
                    styles.languageSwitchText,
                    selected ? styles.languageSwitchTextSelected : null,
                  ]}
                >
                  {t(option.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>{t("settings.timezone.title")}</Text>
        <Text style={styles.metaText}>{t("settings.timezone.subtitle")}</Text>
        <TimezoneDropdown
          value={timezone}
          onChange={(value) => {
            setTimezone(value);
            setSettingsMessage(null);
            setSettingsError(null);
          }}
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
        {statusMessage ? <AlertBox message={statusMessage} tone="info" /> : null}
        <TouchableOpacity
          style={[styles.secondaryButton, registering ? styles.buttonDisabled : null]}
          disabled={registering}
          onPress={pushToken ? disable : register}
        >
          <Text style={styles.secondaryButtonText}>
            {registering
              ? pushToken
                ? t("settings.notifications.disabling")
                : t("settings.notifications.loading")
              : pushToken
                ? t("settings.notifications.disableButton")
                : t("settings.notifications.button")}
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
  onEdit,
  onTend,
  subdued = false,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  emptyMessage?: string;
  items: ItemResponse[];
  onEdit: (item: ItemResponse) => void;
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
                onEdit={() => onEdit(item)}
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
  onEdit,
  onTend,
  subdued,
}: { item: ItemResponse; onEdit: () => void; onTend: () => void; subdued?: boolean }) {
  const mustAttention = item.type === "must" && item.status === "needs_attention";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      accessibilityHint={t("items.edit.title")}
      onPress={onEdit}
      style={[
        styles.itemCard,
        mustAttention ? styles.mustAttentionCard : null,
        subdued ? styles.subduedCard : null,
      ]}
    >
      <Text style={styles.itemTitle}>{item.name}</Text>
      <View style={styles.itemMetaRow}>
        <TypeBadge type={item.type} />
        {item.sharedWith ? <SharedWithBadge displayName={item.sharedWith.displayName} /> : null}
        <Text style={styles.relativeTimeText}>{relativeTendedLabel(item)}</Text>
      </View>
      <View style={styles.itemFooter}>
        <StatusBadge status={item.status} />
        <TouchableOpacity style={styles.markButton} onPress={onTend}>
          <Check size={16} color={colors.inverse} />
          <Text style={styles.markButtonText}>{t("items.markTended")}</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
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
              label={lifeAreaLabel(area)}
              selected={selected === area}
              onPress={() => onChange(area)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TimezoneDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = useMemo(() => {
    if (TIMEZONE_OPTIONS.includes(value as (typeof TIMEZONE_OPTIONS)[number])) {
      return [...TIMEZONE_OPTIONS];
    }

    return [value, ...TIMEZONE_OPTIONS];
  }, [value]);

  return (
    <View style={styles.dropdownWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.dropdownButton}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={styles.dropdownButtonText} numberOfLines={1}>
          {value || t("settings.timezone.placeholder")}
        </Text>
        <View style={[styles.dropdownChevron, open ? styles.sectionChevronOpen : null]}>
          <ChevronDown size={16} color={colors.textMuted} />
        </View>
      </Pressable>

      {open ? (
        <View style={styles.dropdownMenu}>
          {options.map((option) => {
            const selected = option === value;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.dropdownOption, selected ? styles.dropdownOptionSelected : null]}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selected ? styles.dropdownOptionTextSelected : null,
                  ]}
                >
                  {option}
                </Text>
                {selected ? <Check size={16} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
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

function SharedWithBadge({ displayName }: { displayName: string }) {
  const label = t("items.sharedWith", { name: displayName });

  return (
    <View accessibilityLabel={label} style={styles.sharedWithBadge}>
      <Users size={12} color={colors.shared} />
      <Text numberOfLines={1} style={styles.sharedWithBadgeText}>
        {label}
      </Text>
    </View>
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
    <KeyboardAwareScreen>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.screenContent, styles.keyboardAwareScrollContent]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode="on-drag"
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
    </KeyboardAwareScreen>
  );
}

function KeyboardAwareScreen({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidingBehavior(Platform.OS)}
      style={styles.keyboardAwareScreen}
    >
      {children}
    </KeyboardAvoidingView>
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
  root: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  app: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalBackButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  modalScreen: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  screenFrame: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  screen: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  keyboardAwareScreen: {
    flex: 1,
  },
  keyboardAwareScrollContent: {
    paddingBottom: spacing.xxxl * 2,
  },
  screenContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  reminderBanner: {
    backgroundColor: colors.staleBg,
    borderColor: "#e7d8bd",
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  reminderBannerMust: {
    borderColor: "#e7d8bd",
  },
  reminderBannerTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemibold,
    fontSize: 19,
    lineHeight: 25,
  },
  reminderList: {
    gap: spacing.sm,
  },
  reminderRow: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.md,
  },
  reminderText: {
    gap: spacing.xs,
  },
  reminderName: {
    color: colors.text,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    lineHeight: 21,
  },
  reminderActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-start",
  },
  itemCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  mustAttentionCard: {
    borderColor: colors.border,
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
    flexWrap: "wrap",
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
  sharedWithBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.sharedBg,
    borderColor: colors.sharedBorder,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    maxWidth: "100%",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sharedWithBadgeText: {
    color: colors.shared,
    flexShrink: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
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
  markButtonCompact: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    marginLeft: "auto",
    minHeight: 36,
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
  dropdownWrap: {
    marginTop: spacing.md,
  },
  dropdownButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dropdownButtonText: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  dropdownChevron: {
    marginLeft: spacing.sm,
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  dropdownOption: {
    alignItems: "center",
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.primaryMuted,
  },
  dropdownOptionText: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  dropdownOptionTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
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
  deleteItemSection: {
    borderColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  deleteItemHelp: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  deleteItemButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  deleteItemButtonText: {
    color: colors.error,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
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
    marginTop: spacing.md,
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
  activityActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  activityEditRow: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  activityEditHeader: {
    marginBottom: spacing.sm,
  },
  activityEditActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  activitySaveButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  activitySaveButtonText: {
    color: colors.inverse,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
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
  languageSwitch: {
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  languageSwitchOption: {
    alignItems: "center",
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  languageSwitchSelected: {
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
  },
  languageSwitchText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  languageSwitchTextSelected: {
    color: colors.text,
    fontFamily: fonts.bodySemibold,
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
