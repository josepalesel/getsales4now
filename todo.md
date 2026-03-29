# GetSales4Now - Project TODO

## Foundation & Setup
- [x] Database schema: users, tenants, contacts, companies, opportunities, pipelines, tasks
- [x] Database schema: campaigns, social_posts, funnels, pages, conversations, channels
- [x] Database schema: bot_sessions, agent_actions, approvals, integrations, workflows, templates
- [x] Database schema: reports, audit_logs, locales/preferences, onboarding_progress
- [x] tRPC routers: auth, onboarding, crm, campaigns, social, funnels, inbox, ai, reports, integrations
- [x] i18n system with PT-BR, EN-US, ES-419 support (4 independent language levels)
- [x] Upload logo to CDN and configure PWA manifest

## Design System & Layout
- [x] Global CSS theme with GetSales4Now brand colors (orange/red/dark-navy)
- [x] DashboardLayout with sidebar navigation for all 10 modules
- [x] Responsive mobile-first layout with PWA support
- [x] Dark theme with vibrant accent colors matching the logo
- [x] Language switcher component (UI language)
- [x] Notification system (toasts + bell icon)

## Landing Page & Authentication
- [x] Professional landing page with hero section, features, pricing CTA
- [x] Login/Register flow with Manus OAuth
- [x] Post-login redirect to onboarding or dashboard

## Onboarding Wizard (Module 1)
- [x] Step 1: Language selection (EN/ES/PT)
- [x] Step 2: Country and market selection
- [x] Step 3: Business type (services, health, beauty, real estate, insurance, legal, accounting)
- [x] Step 4: Primary objective
- [x] Step 5: Communication channels (WhatsApp, email, SMS, social)
- [x] Step 6: Brand voice and tone
- [x] Step 7: Target audience definition
- [x] Step 8: Activation checklist (GHL connection, WhatsApp, email)
- [x] Save onboarding progress to DB per user

## CRM Module (Module 2)
- [x] Contacts list with search, filters, import
- [x] Contact detail page with timeline, tasks, notes
- [x] Companies list and detail
- [x] Opportunities list with lead scoring badges
- [x] Visual Kanban pipeline with drag-and-drop
- [x] Next-action suggestions panel
- [x] Automatic reminders and lead reactivation alerts
- [x] CRM tRPC procedures (CRUD contacts, companies, opportunities, tasks)

## Campaigns & Automation (Module 3)
- [x] Campaign list with status, channel, objective filters
- [x] Campaign builder: objective-based (leads, sales, booking, retention, follow-up)
- [x] Channel support: email, WhatsApp, SMS
- [x] Sequence builder with human-language step descriptions
- [x] Template library by niche and language
- [x] Approval workflow for sensitive/mass actions
- [x] Playbook library (pre-built automation flows)
- [x] Campaign tRPC procedures

## Social Media (Module 4)
- [x] Editorial calendar view (month/week)
- [x] AI-assisted post generator (multi-language, B2B/B2C variants)
- [x] Post scheduling with channel selection
- [x] Content idea library
- [x] Content repurposing suggestions
- [x] Performance analytics per post/channel
- [x] Social tRPC procedures

## Funnels & Pages (Module 5)
- [x] Funnel list with visual map
- [x] Guided funnel builder (step-by-step wizard)
- [x] Templates by objective and niche
- [x] Landing page builder (basic)
- [x] Form builder
- [x] Booking page template
- [x] Copy assistant (AI-powered)
- [x] Conversion recommendations
- [x] Funnel tRPC procedures

## Omnichannel Inbox (Module 6)
- [x] Unified inbox with channel tabs (WhatsApp, email, SMS, web chat)
- [x] Conversation thread view
- [x] Suggested replies (AI-powered)
- [x] Text bot configuration
- [x] Voice bot configuration
- [x] Human handoff flow
- [x] Auto-transcription display
- [x] Intent detection badges
- [x] Language detection indicator
- [x] Inbox tRPC procedures

## AI Copilots (Module 7)
- [x] Central AI guidance agent (chat interface)
- [x] CRM Copilot (contact insights, next actions)
- [x] Content Copilot (post/copy generation)
- [x] Funnel Copilot (conversion optimization tips)
- [x] Support Copilot (suggested responses)
- [x] Reports Copilot (metrics interpretation)
- [x] Approval gates for critical AI actions
- [x] AI action logs
- [x] AI tRPC procedures with invokeLLM

## Reports & Dashboards (Module 8)
- [x] Beginner dashboard (simple KPIs: leads, response time, bookings, conversions)
- [x] Executive view (high-level metrics)
- [x] Operational view (detailed metrics)
- [x] Channel performance charts
- [x] Campaign performance charts
- [x] "What to improve" actionable suggestions
- [x] Alerts panel
- [x] Reports tRPC procedures

## Integration Hub (Module 9)
- [x] Integration cards: GHL, n8n, WhatsApp, Email, Meta, LinkedIn, Telephony
- [x] Connection status health checks
- [x] Webhook configuration UI
- [x] Error alerts and reconnection flows
- [x] API key management (secure)
- [x] Integrations tRPC procedures

## PWA & Performance
- [x] PWA manifest.json with GetSales4Now branding
- [x] Service worker for offline support
- [x] App icons (192x192, 512x512)
- [x] Install prompt component
- [x] Offline fallback page

## Testing
- [x] Vitest tests for CRM procedures
- [x] Vitest tests for campaign procedures
- [x] Vitest tests for AI copilot procedures
- [x] Vitest tests for auth flow

## Admin Panel
- [x] DB schema: app_settings table (key/value global config)
- [x] DB schema: audit_logs table (action, userId, resource, details, timestamp)
- [x] tRPC adminRouter: listUsers, updateUserRole, suspendUser, deleteUser
- [x] tRPC adminRouter: getSettings, updateSetting, listAuditLogs
- [x] tRPC adminRouter: getSystemStats (total users, active sessions, DB size, etc.)
- [x] Admin route guard (adminProcedure middleware)
- [x] Admin Panel page /admin with sidebar sub-navigation
- [x] Users tab: table with search, role badge, status, actions (promote/suspend/delete)
- [x] Permissions tab: role matrix showing what each role can access
- [x] App Settings tab: global config (app name, default language, maintenance mode, feature flags)
- [x] Audit Log tab: searchable log of all admin/system actions
- [x] System Health tab: server stats, DB status, integration health
- [x] Admin access guard on frontend (redirect non-admins)
- [x] Vitest tests for admin procedures

## Bug Fixes
- [x] Fix Vite HMR WebSocket connection error in dev environment

## GHL Sub-Account Creation + Stripe Payments
- [x] DB: subscriptions table (userId, plan, stripeCustomerId, stripeSubscriptionId, status, ghlLocationId)
- [x] DB: plans table seeded (Free, Pro, Business, Agency)
- [x] GHL API service: createLocation() helper using GHL API v2
- [x] GHL API service: createUser() helper to add user to new location
- [x] tRPC: billing router (getPlans, createCheckout, handleWebhook, getSubscription, cancelSubscription)
- [x] tRPC: ghl provisioning router (createSubAccount, getSubAccountStatus)
- [x] Stripe Checkout integration with plan selection
- [x] Stripe webhook handler: provision GHL sub-account on payment success
- [x] Pricing page /pricing with plan cards (Free, Pro, Business, Agency)
- [x] Post-signup flow: plan selection → Stripe checkout → GHL sub-account creation → dashboard
- [x] Subscription management page /billing (current plan, usage, upgrade/cancel)
- [x] Plan-based feature flags middleware
- [x] Admin panel: subscriptions tab with GHL sub-account status
- [x] Vitest tests for billing and GHL provisioning logic

## Auth Própria + Cadastro + Planos + GHL Onboarding
- [x] DB: adicionar campo passwordHash na tabela users
- [x] DB: adicionar campo emailVerified, trialEndsAt, trialStartedAt na tabela users
- [x] Backend: router auth.register (nome, email, senha, plano)
- [x] Backend: router auth.login (email, senha) com JWT cookie próprio
- [x] Backend: router auth.forgotPassword / resetPassword
- [x] Stripe: criar produtos Starter USD 118/mês e Business USD 398/mês com 14 dias trial
- [x] Stripe: createCheckout com trial_period_days: 14 e cartão obrigatório
- [x] Página /register: form nome, email, senha, conf senha + seleção de plano Starter/Business
- [x] Página /login: form email + senha com link "Esqueci minha senha"
- [x] Página /checkout: resumo do plano + redirecionamento Stripe Checkout
- [x] Página /welcome: pós-pagamento, confirma trial e inicia onboarding GHL
- [x] Wizard de onboarding da sub-conta GHL: nome empresa, país, telefone, segmento, GHL token
- [x] Integração GHL: criar sub-conta automaticamente ao completar onboarding
- [x] Dashboard: banner de trial com dias restantes e CTA para adicionar cartão
- [x] Testes Vitest para register, login e checkout flow
