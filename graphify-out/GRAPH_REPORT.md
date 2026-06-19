# Graph Report - .  (2026-06-19)

## Corpus Check
- 344 files · ~98,570 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1641 nodes · 3364 edges · 106 communities (84 shown, 22 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_serialize ts|serialize ts]]
- [[_COMMUNITY_App tsx|App tsx]]
- [[_COMMUNITY_ts|ts]]
- [[_COMMUNITY_session ts|session ts]]
- [[_COMMUNITY_Components|Components]]
- [[_COMMUNITY_item form tsx|item form tsx]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_jsonData|jsonData]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_getDb|getDb]]
- [[_COMMUNITY_Pre Alpha Development Plan|Pre Alpha Development Plan]]
- [[_COMMUNITY_serialize ts|serialize ts]]
- [[_COMMUNITY_item form tsx|item form tsx]]
- [[_COMMUNITY_home view tsx|home view tsx]]
- [[_COMMUNITY_Design Language|Design Language]]
- [[_COMMUNITY_Mvp User Stories|Mvp User Stories]]
- [[_COMMUNITY_onboarding flow tsx|onboarding flow tsx]]
- [[_COMMUNITY_ts|ts]]
- [[_COMMUNITY_activity view tsx|activity view tsx]]
- [[_COMMUNITY_component types ts|component types ts]]
- [[_COMMUNITY_Alpha Roadmap|Alpha Roadmap]]
- [[_COMMUNITY_canonical host ts|canonical host ts]]
- [[_COMMUNITY_expo|expo]]
- [[_COMMUNITY_Deployment|Deployment]]
- [[_COMMUNITY_TendApi|TendApi]]
- [[_COMMUNITY_Readme|Readme]]
- [[_COMMUNITY_auth tsx|auth tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_Manual Test Script|Manual Test Script]]
- [[_COMMUNITY_verify deps mjs|verify deps mjs]]
- [[_COMMUNITY_pushNotifications ts|pushNotifications ts]]
- [[_COMMUNITY_legal tsx|legal tsx]]
- [[_COMMUNITY_ts|ts]]
- [[_COMMUNITY_client tsx|client tsx]]
- [[_COMMUNITY_landing promo preview tsx|landing promo preview tsx]]
- [[_COMMUNITY_package json|package json]]
- [[_COMMUNITY_useHomeItems ts|useHomeItems ts]]
- [[_COMMUNITY_presets ts|presets ts]]
- [[_COMMUNITY_Alpha Development Plan|Alpha Development Plan]]
- [[_COMMUNITY_rhythm select tsx|rhythm select tsx]]
- [[_COMMUNITY_ignore|ignore]]
- [[_COMMUNITY_life area filter tsx|life area filter tsx]]
- [[_COMMUNITY_week groups ts|week groups ts]]
- [[_COMMUNITY_time select tsx|time select tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_Readme|Readme]]
- [[_COMMUNITY_skeleton tsx|skeleton tsx]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_tasks|tasks]]
- [[_COMMUNITY_validation ts|validation ts]]
- [[_COMMUNITY_preset card tsx|preset card tsx]]
- [[_COMMUNITY_Items|Items]]
- [[_COMMUNITY_isDevMode|isDevMode]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_tendApi ts|tendApi ts]]
- [[_COMMUNITY_package json|package json]]
- [[_COMMUNITY_Terms|Terms]]
- [[_COMMUNITY_validation ts|validation ts]]
- [[_COMMUNITY_compare windows ts|compare windows ts]]
- [[_COMMUNITY_tsconfig json|tsconfig json]]
- [[_COMMUNITY_Privacy|Privacy]]
- [[_COMMUNITY_Product|Product]]
- [[_COMMUNITY_migrate ts|migrate ts]]
- [[_COMMUNITY_Auth|Auth]]
- [[_COMMUNITY_overrides|overrides]]
- [[_COMMUNITY_apiBaseUrl test ts|apiBaseUrl test ts]]
- [[_COMMUNITY_tsconfig json|tsconfig json]]
- [[_COMMUNITY_nativeModuleMocks ts|nativeModuleMocks ts]]
- [[_COMMUNITY_package json|package json]]
- [[_COMMUNITY_tabTransition ts|tabTransition ts]]
- [[_COMMUNITY_Activity|Activity]]
- [[_COMMUNITY_useActivityEvents ts|useActivityEvents ts]]
- [[_COMMUNITY_useAvailabilityWindows ts|useAvailabilityWindows ts]]
- [[_COMMUNITY_Skill|Skill]]
- [[_COMMUNITY_vercel json|vercel json]]
- [[_COMMUNITY_Availability|Availability]]
- [[_COMMUNITY_Onboarding|Onboarding]]
- [[_COMMUNITY_Settings|Settings]]
- [[_COMMUNITY_env ts|env ts]]
- [[_COMMUNITY_metro js|metro js]]
- [[_COMMUNITY_dev|dev]]
- [[_COMMUNITY_test|test]]
- [[_COMMUNITY_Health|Health]]
- [[_COMMUNITY_Reminders|Reminders]]
- [[_COMMUNITY_drizzle ts|drizzle ts]]
- [[_COMMUNITY_next ts|next ts]]
- [[_COMMUNITY_postcss mjs|postcss mjs]]
- [[_COMMUNITY_Openai|Openai]]
- [[_COMMUNITY_Icon|Icon]]
- [[_COMMUNITY_App Icon|App Icon]]
- [[_COMMUNITY_Tend Logo|Tend Logo]]
- [[_COMMUNITY_Docker Compose|Docker Compose]]
- [[_COMMUNITY_Promo Compositions|Promo Compositions]]
- [[_COMMUNITY_Tend Activity|Tend Activity]]
- [[_COMMUNITY_Tend Care|Tend Care]]
- [[_COMMUNITY_Tend Logo|Tend Logo]]
- [[_COMMUNITY_Tend Remember|Tend Remember]]
- [[_COMMUNITY_Tend Reminder|Tend Reminder]]
- [[_COMMUNITY_Ci|Ci]]

## God Nodes (most connected - your core abstractions)
1. `t()` - 56 edges
2. `getDb()` - 51 edges
3. `cn()` - 51 edges
4. `Components` - 50 edges
5. `jsonData()` - 36 edges
6. `Pre Alpha Development Plan` - 36 edges
7. `Design Language` - 32 edges
8. `Mvp User Stories` - 32 edges
9. `requireUser()` - 31 edges
10. `TendApi` - 30 edges

## Surprising Connections (you probably didn't know these)
- `timeOptionsAfter()` --calls--> `parseTimeToMinutes()`  [INFERRED]
  apps/mobile/src/utils/timeOptions.ts → packages/domain/src/time.ts
- `PresetCardProps` --references--> `TendItemType`  [EXTRACTED]
  apps/web/components/tend/preset-card.tsx → packages/domain/src/types.ts
- `AddItemScreen()` --calls--> `t()`  [INFERRED]
  apps/mobile/App.tsx → apps/mobile/src/i18n/index.ts
- `EditItemScreen()` --calls--> `t()`  [INFERRED]
  apps/mobile/App.tsx → apps/mobile/src/i18n/index.ts
- `LifeAreaFilter()` --calls--> `t()`  [INFERRED]
  apps/mobile/App.tsx → apps/mobile/src/i18n/index.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Skill Structure** — tend_change_instructions_skill_tend_change_instructions, tend_change_instructions_skill_required_workflow, tend_change_instructions_skill_practical_notes [EXTRACTED 1.00]
- **Product Structure** — product_product, product_users, product_product_purpose, product_brand_personality, product_anti_references, product_design_principles, product_accessibility_inclusion [EXTRACTED 1.00]
- **Readme Structure** — readme_product, readme_who_it_s_for, readme_how_it_works, readme_principles, readme_pre_alpha_shipped, readme_alpha_next, readme_development, readme_tech_stack, readme_repository_structure, readme_prerequisites, readme_getting_started, readme_edit_env_set_sessionsecret_to_a_random_32_byte_string [EXTRACTED 1.00]
- **Privacy Structure** — legal_privacy_privacy_policy, legal_privacy_what_we_store, legal_privacy_how_we_use_your_data, legal_privacy_where_data_is_hosted, legal_privacy_retention_and_deletion, legal_privacy_contact [EXTRACTED 1.00]
- **Terms Structure** — legal_terms_terms_of_service, legal_terms_the_service, legal_terms_your_account, legal_terms_acceptable_use, legal_terms_availability, legal_terms_data_and_privacy, legal_terms_contact [EXTRACTED 1.00]
- **Alpha Development Plan Structure** — docs_alpha_development_plan_tend_alpha_development_plan_phases_1_4, docs_alpha_development_plan_product_decisions_resolve_before_phase_1, docs_alpha_development_plan_current_state_pre_alpha_gaps, docs_alpha_development_plan_implementation_phases, docs_alpha_development_plan_phase_1_public_shell_landing_legal_samples, docs_alpha_development_plan_phase_2_account_deletion, docs_alpha_development_plan_phase_3_expanded_preset_catalog, docs_alpha_development_plan_phase_4_i18n_english_serbian, docs_alpha_development_plan_ui_routes_phases_1_4_additions, docs_alpha_development_plan_api_surface_phases_1_4_additions, docs_alpha_development_plan_testing_strategy, docs_alpha_development_plan_parallel_work [EXTRACTED 1.00]
- **Alpha Roadmap Structure** — docs_alpha_roadmap_tend_alpha_roadmap, docs_alpha_roadmap_alpha_scope, docs_alpha_roadmap_in_scope, docs_alpha_roadmap_explicitly_not_in_alpha, docs_alpha_roadmap_recommended_phase_order, docs_alpha_roadmap_phase_1_public_shell_landing_legal_samples, docs_alpha_roadmap_deliverables, docs_alpha_roadmap_legal_page_content_minimum, docs_alpha_roadmap_design, docs_alpha_roadmap_out_of_scope_for_v1, docs_alpha_roadmap_phase_2_account_deletion, docs_alpha_roadmap_deliverables [EXTRACTED 1.00]
- **Readme Structure** — api_readme_tend_http_api, api_readme_conventions, api_readme_resources, api_readme_changelog [EXTRACTED 1.00]
- **Activity Structure** — api_activity_get_api_v1_activity, api_activity_patch_api_v1_activity_eventid, api_activity_delete_api_v1_activity_eventid [EXTRACTED 1.00]
- **Auth Structure** — api_auth_post_api_v1_auth_register, api_auth_post_api_v1_auth_login, api_auth_post_api_v1_auth_logout, api_auth_get_api_v1_me, api_auth_user [EXTRACTED 1.00]
- **Items Structure** — api_items_get_api_v1_items, api_items_post_api_v1_items, api_items_get_api_v1_items_id, api_items_patch_api_v1_items_id, api_items_delete_api_v1_items_id_confirm_true, api_items_post_api_v1_items_id_tend, api_items_get_api_v1_items_presets, api_items_item, api_items_tendevent, api_items_preset [EXTRACTED 1.00]
- **Deployment Structure** — docs_deployment_deployment_vercel_neon_cloudflare, docs_deployment_overview, docs_deployment_1_neon_postgresql, docs_deployment_apply_migrations_locally_first_time, docs_deployment_in_your_env_or_export_inline, docs_deployment_2_vercel_next_js_app, docs_deployment_connect_the_repo, docs_deployment_environment_variables, docs_deployment_deploy, docs_deployment_custom_domains_before_cloudflare, docs_deployment_3_cloudflare_dns_for_digitalplat_domain, docs_deployment_move_dns_to_cloudflare [EXTRACTED 1.00]
- **Readme Structure** — design_readme_tend_design_system, design_readme_agent_instructions, design_readme_documents, design_readme_intended_stack, design_readme_reusable_components, design_readme_implementation_status, design_readme_file_layout, design_readme_domain_types_to_import [EXTRACTED 1.00]
- **Components Structure** — design_components_tend_component_catalog, design_components_quick_reference, design_components_layout, design_components_appshell, design_components_sitefooter, design_components_tendlogolink, design_components_usermenu, design_components_pageheader, design_components_onboardingstep, design_components_onboardinglayout, design_components_promocarousel, design_components_primitives_shadcn_themed [EXTRACTED 1.00]
- **Design Language Structure** — design_design_language_tend_design_language, design_design_language_1_design_principles, design_design_language_anti_patterns_do_not_build, design_design_language_2_visual_personality, design_design_language_3_typography, design_design_language_font_pairing, design_design_language_type_scale, design_design_language_copy_tone, design_design_language_4_color_system, design_design_language_surfaces, design_design_language_status_colors, design_design_language_type_colors [EXTRACTED 1.00]
- **Manual Test Script Structure** — docs_manual_test_script_tend_pre_alpha_manual_test_script, docs_manual_test_script_story_1_local_account, docs_manual_test_script_story_2_onboarding, docs_manual_test_script_story_3_quick_add_item, docs_manual_test_script_story_4_presets, docs_manual_test_script_story_5_home_attention_view, docs_manual_test_script_story_6_item_detail, docs_manual_test_script_story_7_mark_tended, docs_manual_test_script_story_8_edit_item, docs_manual_test_script_story_9_archive_delete, docs_manual_test_script_story_10_availability, docs_manual_test_script_story_11_in_app_reminders [EXTRACTED 1.00]
- **Mvp User Stories Structure** — docs_mvp_user_stories_tend_mvp_user_stories, docs_mvp_user_stories_product_summary, docs_mvp_user_stories_mvp_principles, docs_mvp_user_stories_core_concepts, docs_mvp_user_stories_tend_item, docs_mvp_user_stories_type, docs_mvp_user_stories_rhythm, docs_mvp_user_stories_last_tended, docs_mvp_user_stories_status, docs_mvp_user_stories_availability, docs_mvp_user_stories_pre_alpha_scope_decisions, docs_mvp_user_stories_story_validation_summary [EXTRACTED 1.00]
- **Pre Alpha Development Plan Structure** — docs_pre_alpha_development_plan_tend_pre_alpha_development_plan, docs_pre_alpha_development_plan_product_decisions_resolve_before_build, docs_pre_alpha_development_plan_repository_layout, docs_pre_alpha_development_plan_technology_choices, docs_pre_alpha_development_plan_core, docs_pre_alpha_development_plan_mobile_path_post_pre_alpha, docs_pre_alpha_development_plan_explicitly_not_in_pre_alpha, docs_pre_alpha_development_plan_data_model, docs_pre_alpha_development_plan_users, docs_pre_alpha_development_plan_sessions, docs_pre_alpha_development_plan_tenditems, docs_pre_alpha_development_plan_tendevents [EXTRACTED 1.00]

## Communities (106 total, 22 thin omitted)

### Community 0 - "serialize ts"
Cohesion: 0.06
Nodes (47): availabilityWindowSchema, replaceAvailabilitySchema, timeSchema, buildAggregatedReminderCopy(), buildFreeTimeReminderHeadline(), buildReminderCopy(), FREE_TIME_HEADLINE_VARIANTS, FreeTimeHeadlineBuilder (+39 more)

### Community 1 - "App tsx"
Cohesion: 0.04
Nodes (38): useActivityEvents(), useAvailabilityWindows(), getLocale(), isLocale(), Locale, LOCALE_OPTIONS, ActivityScreen(), AddItemScreen() (+30 more)

### Community 2 - "ts"
Cohesion: 0.07
Nodes (38): serializeAvailabilityWindow(), toDomainAvailabilityWindow(), GET(), checkHealth(), HealthResult, UserSettingsResponse, AvailabilityWindowInput, AvailabilityWindowRow (+30 more)

### Community 3 - "session ts"
Cohesion: 0.09
Nodes (35): adapter, AuthUser, lucia, LuciaAuthUser, Register, toAuthUser(), applySessionCookie(), clearSessionCookie() (+27 more)

### Community 4 - "Components"
Cohesion: 0.04
Nodes (51): ActivityListItem, Alert, AppShell, AttentionSection, AuthForm, AvailabilityEditor, Button, Card (+43 more)

### Community 5 - "item form tsx"
Cohesion: 0.09
Nodes (33): DatePickerField(), DatePickerFieldProps, formatDisplayDate(), parseDateInput(), styles, FormField(), FormFieldProps, formInputStyles (+25 more)

### Community 6 - "dependencies"
Cohesion: 0.05
Nodes (41): dependencies, @babel/runtime, expo, expo-asset, expo-constants, expo-device, expo-file-system, expo-font (+33 more)

### Community 7 - "dependencies"
Cohesion: 0.05
Nodes (39): dependencies, bcryptjs, class-variance-authority, clsx, dotenv, lucia, @lucia-auth/adapter-drizzle, lucide-react (+31 more)

### Community 8 - "jsonData"
Cohesion: 0.18
Nodes (28): GET(), formatZodError(), isErrorResponse(), requireUser(), GET(), PUT(), formatZodError(), DELETE() (+20 more)

### Community 9 - "cn"
Cohesion: 0.13
Nodes (25): statusStyles(), typeStyles(), AuthFormData, AuthFormProps, PageHeader(), PageHeaderProps, cn(), MarkTendedButton() (+17 more)

### Community 10 - "getDb"
Cohesion: 0.13
Nodes (25): ActivityPage(), metadata, serializeActivityEntry(), NotFound(), HomePage(), metadata, validateSession(), AvailabilitySettingsPage() (+17 more)

### Community 11 - "Pre Alpha Development Plan"
Cohesion: 0.05
Nodes (37): After pre-alpha, API surface (/api/v1), Attention ordering, availabilitywindows, Core, Data model, Definition of done (pre-alpha), Pre Alpha Development Plan (+29 more)

### Community 12 - "serialize ts"
Cohesion: 0.13
Nodes (28): GET(), PATCH(), RouteContext, getSessionIdFromResponse(), registerTestUser(), uniqueEmail(), POST(), serializeItem() (+20 more)

### Community 13 - "item form tsx"
Cohesion: 0.12
Nodes (24): AvailabilityWindowResponse, formatEventDate(), AvailabilityEditorProps, DAYS, EditableWindow, FormField(), FormFieldProps, ItemFormProps (+16 more)

### Community 14 - "home view tsx"
Cohesion: 0.10
Nodes (25): AttentionGroups, AttentionListItem, buildAttentionGroups(), getAttentionSectionDefaults(), hasItemsNeedingAttention(), shouldShowAllFreshBanner(), sortForAttention(), STATUS_RANK (+17 more)

### Community 15 - "Design Language"
Cohesion: 0.06
Nodes (33): 10. Accessibility, 11. shadcn theming notes, 12. Reference mood, 1. Design principles, 2. Visual personality, 3. Typography, 4. Color system, 5. Spacing & layout (+25 more)

### Community 16 - "Mvp User Stories"
Cohesion: 0.06
Nodes (33): Availability, Core Concepts, Mvp User Stories, Last Tended, MVP Principles, MVP User Stories, Non-Goals, Open Product Questions (+25 more)

### Community 17 - "onboarding flow tsx"
Cohesion: 0.12
Nodes (22): ItemFormOrigin, OnboardingFlow(), Step, STEP_MAP, AddItemForm(), AddItemFormProps, ItemForm(), OnboardingStep() (+14 more)

### Community 18 - "ts"
Cohesion: 0.14
Nodes (20): PresetSuggestions(), PresetSuggestionsProps, styles, handleRegistrationResult(), en, DICTIONARIES, LIFE_AREA_KEYS, lifeAreaFilterToggleLabel() (+12 more)

### Community 19 - "activity view tsx"
Cohesion: 0.12
Nodes (21): useI18n(), AppShell(), AppShellProps, NAV_ITEMS, OnboardingLayout(), OnboardingLayoutProps, SiteFooter(), TendLogoLink() (+13 more)

### Community 20 - "component types ts"
Cohesion: 0.07
Nodes (28): ActivityListItemProps, AppShellProps, AttentionSectionProps, AuthFormData, AuthFormProps, AvailabilityEditorProps, AvailabilityWindow, ConfirmDialogProps (+20 more)

### Community 21 - "Alpha Roadmap"
Cohesion: 0.07
Nodes (29): After alpha, Alpha scope, Alpha shortcut, Candidate new life areas (pick 4–6), Cross-cutting alpha checklist, Current constraint, Definition of done (alpha), Deliverables (+21 more)

### Community 22 - "canonical host ts"
Cohesion: 0.20
Nodes (21): allowsUnauthenticatedAccess(), isPublicPath(), isStaticAssetPath(), PUBLIC_PATHS, appUrl(), buildHostRedirectUrl(), getAppOrigin(), getCanonicalAppHost() (+13 more)

### Community 23 - "expo"
Cohesion: 0.08
Nodes (23): backgroundColor, foregroundImage, adaptiveIcon, edgeToEdgeEnabled, googleServicesFile, package, projectId, expo (+15 more)

### Community 24 - "Deployment"
Cohesion: 0.08
Nodes (24): 1. Neon — PostgreSQL, 2. Vercel — Next.js app, 3. Cloudflare — DNS for DigitalPlat domain, 4. Post-deploy checklist, Apply migrations locally (first time), Auth cookies not sticking, Block direct .vercel.app access, Build fails on db:migrate (+16 more)

### Community 26 - "Readme"
Cohesion: 0.00
Nodes (22): Alpha — next, API documentation, apps/web/package.json: "version": "0.2.0", Deployment, Development, Edit .env — set SESSIONSECRET to a random 32+ byte string, Edit version.json, then sync package.json for the app version, Getting started (+14 more)

### Community 27 - "auth tsx"
Cohesion: 0.16
Nodes (13): isEmailAllowed(), isRegistrationRestricted(), parseAllowedEmails(), AuthForm(), LoginForm(), RegisterForm(), AuthLayout(), AuthLayoutProps (+5 more)

### Community 28 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, baseUrl, jsx, lib, module, moduleResolution, noEmit, paths (+13 more)

### Community 29 - "Manual Test Script"
Cohesion: 0.11
Nodes (18): Manual Test Script, Notes for testers, Smoke checks, Story 10 — Availability, Story 11 — In-app reminders, Story 12 — Must vs want guidance, Story 13 — Life area filter, Story 14 — Recent activity (+10 more)

### Community 30 - "verify deps mjs"
Cohesion: 0.12
Nodes (16): useHomeItems(), AuthFormShell(), authPromoSlides(), AuthSplashScreen(), BootLoader(), HomeScreen(), OnboardingFlow(), OnboardingShell() (+8 more)

### Community 31 - "pushNotifications ts"
Cohesion: 0.25
Nodes (15): scheduleNextReminderNotification(), buildTendNotificationRequest(), configurePushNotifications(), disablePushNotifications(), ensureNotificationHandler(), getStoredPushToken(), loadNotificationsModule(), NotificationsModule (+7 more)

### Community 32 - "legal tsx"
Cohesion: 0.19
Nodes (10): getLegalDisclaimer(), LEGAL_DIR, LegalDocumentSlug, loadLegalDocument(), MarkdownContent(), parseInline(), LegalPage(), LegalPageProps (+2 more)

### Community 33 - "ts"
Cohesion: 0.20
Nodes (12): isoToDateInputValue(), ActivityEntryResponse, AvailabilityWindowResponse, ItemResponse, OnboardingStatusResponse, ReminderResponse, RemindersResponse, UserResponse (+4 more)

### Community 34 - "client tsx"
Cohesion: 0.18
Nodes (10): body, display, metadata, I18nContext, I18nContextValue, I18nProvider(), dictionaries, en (+2 more)

### Community 35 - "landing promo preview tsx"
Cohesion: 0.21
Nodes (7): nextCarouselIndex(), SHARED_PROMO_CAROUSEL_OPTS, LandingPromoPreview(), PromoCarousel(), PromoCarouselProps, ONBOARDING_PROMO_SLIDES, OnboardingPromoSlide

### Community 36 - "package json"
Cohesion: 0.12
Nodes (16): dependencies, drizzle-orm, postgres, devDependencies, dotenv, drizzle-kit, exports, name (+8 more)

### Community 37 - "useHomeItems ts"
Cohesion: 0.22
Nodes (8): ApiError, SessionClient, formatNetworkErrorMessage(), getErrorMessage(), isNetworkFailureMessage(), toNetworkApiError(), restoreSession(), SessionClient

### Community 38 - "presets ts"
Cohesion: 0.13
Nodes (15): ALL_PRESETS, finance, foodKitchen, getPresetsByArea(), health, homeMaintenance, household, kidsFamily (+7 more)

### Community 39 - "Alpha Development Plan"
Cohesion: 0.12
Nodes (16): API surface (Phases 1–4 additions), Current state (pre-alpha gaps), Definition of done (Phases 1–4), Alpha Development Plan, Implementation phases, Parallel work, Phase 1 — Public shell (landing + legal samples), Phase 2 — Account deletion (+8 more)

### Community 40 - "rhythm select tsx"
Cohesion: 0.18
Nodes (9): itemFormClientSchema, validateItemForm(), rhythmDaysFieldError(), RhythmSelect(), RhythmSelectProps, isPresetRhythm(), RHYTHM_OPTIONS, RhythmOption (+1 more)

### Community 41 - "ignore"
Cohesion: 0.13
Nodes (14): files, ignore, formatter, enabled, indentStyle, indentWidth, lineWidth, linter (+6 more)

### Community 42 - "life area filter tsx"
Cohesion: 0.23
Nodes (11): ItemDraft, LIFE_AREA_LABELS, STATUS_LABELS, TYPE_LABELS, ItemFormValues, LifeArea, LifeAreaChip(), LifeAreaChipProps (+3 more)

### Community 43 - "week groups ts"
Cohesion: 0.27
Nodes (11): ActivityEntryResponse, ActivityWeekGroup, formatActivityWeekLabel(), formatWeekStart(), groupActivityEntriesByWeek(), sameCalendarDay(), startOfDay(), startOfWeek() (+3 more)

### Community 44 - "time select tsx"
Cohesion: 0.29
Nodes (11): styles, TimeSelect(), TimeSelectProps, TriggerLayout, buildTimeOptions(), formatTimeMinutes(), isValidTimeValue(), normalizeTimeValue() (+3 more)

### Community 45 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 46 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+5 more)

### Community 47 - "Readme"
Cohesion: 0.05
Nodes (13): Changelog, Conventions, Readme, Resources, Tend HTTP API, Agent instructions, Documents, Domain types to import (+5 more)

### Community 48 - "skeleton tsx"
Cohesion: 0.17
Nodes (8): ACTIVITY_SKELETON_GROUPS, ActivitySkeleton(), AVAILABILITY_DAY_KEYS, AvailabilitySkeleton(), HomeItemsSkeleton(), SkeletonBone(), styles, useSkeletonPulse()

### Community 49 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, ci:check, db:generate, db:migrate, db:studio, dev, format (+5 more)

### Community 50 - "tasks"
Cohesion: 0.15
Nodes (13): dependsOn, outputs, cache, cache, cache, persistent, outputs, tasks (+5 more)

### Community 51 - "validation ts"
Cohesion: 0.27
Nodes (8): LoginInput, loginSchema, RegisterFormInput, registerFormSchema, RegisterInput, registerSchema, fieldErrorsFromZod(), registerFormFieldErrors()

### Community 52 - "preset card tsx"
Cohesion: 0.33
Nodes (8): formatRelativeFromDays(), formatRelativeTended(), formatRhythm(), startOfDay(), PresetCard(), PresetCardProps, RelativeTime(), RelativeTimeProps

### Community 53 - "Items"
Cohesion: 0.18
Nodes (11): DELETE /api/v1/items/:id?confirm=true, Items, GET /api/v1/items, GET /api/v1/items/:id, GET /api/v1/items/presets, Item, PATCH /api/v1/items/:id, POST /api/v1/items (+3 more)

### Community 54 - "isDevMode"
Cohesion: 0.22
Nodes (8): usePushNotifications(), deviceTimeZone(), LoginScreen(), RegisterScreen(), SettingsScreen(), GlobalWithDev, GlobalWithDev, isDevMode()

### Community 55 - "devDependencies"
Cohesion: 0.20
Nodes (8): devDependencies, @biomejs/biome, husky, turbo, typescript, globalPassThroughEnv, $schema, husky.sh script

### Community 56 - "tendApi ts"
Cohesion: 0.29
Nodes (7): defaultApiBaseUrl, JsonRecord, readApiError(), resolveConfiguredApiBaseUrl(), resolveDefaultApiBaseUrl(), resolveDevApiBaseUrl(), storage

### Community 57 - "package json"
Cohesion: 0.25
Nodes (7): exports, name, private, scripts, test, type, version

### Community 58 - "Terms"
Cohesion: 0.25
Nodes (8): Acceptable use, Availability, Contact, Data and privacy, Terms, Terms of Service, The service, Your account

### Community 59 - "validation ts"
Cohesion: 0.38
Nodes (5): ListActivityQuery, listActivityQuerySchema, optionalIsoDateSchema, UpdateEventInput, updateEventSchema

### Community 60 - "compare windows ts"
Cohesion: 0.43
Nodes (5): availabilityWindowsEqual(), normalizeTimeInput(), TimeWindow, toComparableWindows(), AvailabilityEditor()

### Community 61 - "tsconfig json"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, include

### Community 62 - "Privacy"
Cohesion: 0.29
Nodes (7): Contact, Privacy, How we use your data, Privacy Policy, Retention and deletion, What we store, Where data is hosted

### Community 63 - "Product"
Cohesion: 0.00
Nodes (6): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Product Purpose, Users

### Community 64 - "migrate ts"
Cohesion: 0.43
Nodes (5): client, db, isStartupError(), STARTUP_ERROR_CODES, waitForDatabase()

### Community 65 - "Auth"
Cohesion: 0.33
Nodes (6): Auth, GET /api/v1/me, POST /api/v1/auth/login, POST /api/v1/auth/logout, POST /api/v1/auth/register, User

### Community 66 - "overrides"
Cohesion: 0.33
Nodes (6): overrides, drizzle-orm, react, react-dom, @types/react, @types/react-dom

### Community 67 - "apiBaseUrl test ts"
Cohesion: 0.67
Nodes (3): isDevApiUrl(), resolveStoredApiBaseUrl(), shouldRefreshDevApiBaseUrl()

### Community 68 - "tsconfig json"
Cohesion: 0.40
Nodes (4): compilerOptions, rootDir, extends, include

### Community 70 - "package json"
Cohesion: 0.40
Nodes (4): name, packageManager, private, workspaces

### Community 71 - "tabTransition ts"
Cohesion: 0.50
Nodes (3): getTabSwitchDirection(), TAB_ORDER, TabKey

### Community 72 - "Activity"
Cohesion: 0.50
Nodes (4): DELETE /api/v1/activity/:eventId, Activity, GET /api/v1/activity, PATCH /api/v1/activity/:eventId

### Community 73 - "useActivityEvents ts"
Cohesion: 0.83
Nodes (3): formatEventDate(), groupEventsByWeek(), weekLabel()

### Community 75 - "Skill"
Cohesion: 0.50
Nodes (4): Skill, Practical Notes, Required Workflow, Tend Change Instructions

### Community 76 - "vercel json"
Cohesion: 0.50
Nodes (3): buildCommand, installCommand, $schema

### Community 77 - "Availability"
Cohesion: 0.67
Nodes (3): Availability, GET /api/v1/availability, PUT /api/v1/availability

### Community 78 - "Onboarding"
Cohesion: 0.67
Nodes (3): Onboarding, GET /api/v1/onboarding, PUT /api/v1/onboarding

### Community 79 - "Settings"
Cohesion: 0.67
Nodes (3): Settings, GET /api/v1/settings, PUT /api/v1/settings

### Community 82 - "dev"
Cohesion: 0.67
Nodes (3): cache, persistent, dev

### Community 83 - "test"
Cohesion: 0.67
Nodes (3): test, dependsOn, outputs

## Knowledge Gaps
- **728 isolated node(s):** `husky.sh script`, `TIMEZONE_OPTIONS`, `FreeTimeHeadlineBuilder`, `FREE_TIME_HEADLINE_VARIANTS`, `AuthMode` (+723 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `ts` to `App tsx`, `useHomeItems ts`, `item form tsx`, `useActivityEvents ts`, `useAvailabilityWindows ts`, `home view tsx`, `activity view tsx`, `isDevMode`, `verify deps mjs`, `pushNotifications ts`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `activity view tsx` to `cn`, `getDb`, `home view tsx`, `onboarding flow tsx`, `ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `getDb()` connect `getDb` to `jsonData`, `ts`, `session ts`, `serialize ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `t()` (e.g. with `AppShell()` and `SiteFooter()`) actually correct?**
  _`t()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky.sh script`, `TIMEZONE_OPTIONS`, `FreeTimeHeadlineBuilder` to the rest of the system?**
  _728 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `serialize ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05507246376811594 - nodes in this community are weakly interconnected._
- **Should `App tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0423728813559322 - nodes in this community are weakly interconnected._