import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AdminGuard } from '@/app/guards/AdminGuard'
import { CustomerGuard } from '@/app/guards/CustomerGuard'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AccountLayout } from '@/layouts/AccountLayout'
import { SiteLayout } from '@/layouts/SiteLayout'
import { LoadingState } from '@/components/public/LoadingState'

const HomePage = lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })))
const ServicesPage = lazy(() => import('@/pages/public/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const ServiceDetailPage = lazy(() =>
  import('@/pages/public/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })),
)
const SolutionsPage = lazy(() => import('@/pages/public/SolutionsPage').then((m) => ({ default: m.SolutionsPage })))
const SolutionDetailPage = lazy(() =>
  import('@/pages/public/SolutionDetailPage').then((m) => ({ default: m.SolutionDetailPage })),
)
const SoftwareListPage = lazy(() =>
  import('@/pages/public/SoftwareListPage').then((m) => ({ default: m.SoftwareListPage })),
)
const SoftwareDetailPage = lazy(() =>
  import('@/pages/public/SoftwareDetailPage').then((m) => ({ default: m.SoftwareDetailPage })),
)
const BlogListPage = lazy(() => import('@/pages/public/BlogListPage').then((m) => ({ default: m.BlogListPage })))
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })))
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })))
const CartPage = lazy(() => import('@/pages/public/CartPage').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/public/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const PaymentSuccessPage = lazy(() =>
  import('@/pages/public/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })),
)
const PaymentFailPage = lazy(() =>
  import('@/pages/public/PaymentFailPage').then((m) => ({ default: m.PaymentFailPage })),
)
const LegalDocumentPage = lazy(() =>
  import('@/pages/public/LegalDocumentPage').then((m) => ({ default: m.LegalDocumentPage })),
)
const LegalTypeDocumentPage = lazy(() =>
  import('@/pages/public/LegalDocumentPage').then((m) => ({ default: m.LegalTypeDocumentPage })),
)
const MesafeliSatisSozlesmesiPage = lazy(() =>
  import('@/pages/public/LegalDocumentPage').then((m) => ({ default: m.MesafeliSatisSozlesmesiPage })),
)
const OnBilgilendirmeFormuPage = lazy(() =>
  import('@/pages/public/LegalDocumentPage').then((m) => ({ default: m.OnBilgilendirmeFormuPage })),
)
const KvkkPage = lazy(() => import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.KvkkPage })))
const PrivacyPage = lazy(() => import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.PrivacyPage })))
const CookiePolicyPage = lazy(() =>
  import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.CookiePolicyPage })),
)
const AcikRizaMetniPage = lazy(() =>
  import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.AcikRizaMetniPage })),
)
const KullanimSartlariPage = lazy(() =>
  import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.KullanimSartlariPage })),
)
const RefundPolicyPage = lazy(() =>
  import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.RefundPolicyPage })),
)
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const CustomerLoginPage = lazy(() =>
  import('@/pages/account/CustomerLoginPage').then((m) => ({ default: m.CustomerLoginPage })),
)
const CustomerRegisterPage = lazy(() =>
  import('@/pages/account/CustomerRegisterPage').then((m) => ({ default: m.CustomerRegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/account/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/account/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const AccountDashboardPage = lazy(() =>
  import('@/pages/account/AccountDashboardPage').then((m) => ({ default: m.AccountDashboardPage })),
)
const AccountOrdersPage = lazy(() =>
  import('@/pages/account/AccountOrdersPage').then((m) => ({ default: m.AccountOrdersPage })),
)
const AccountOrderDetailPage = lazy(() =>
  import('@/pages/account/AccountOrderDetailPage').then((m) => ({ default: m.AccountOrderDetailPage })),
)
const AccountLicensesPage = lazy(() =>
  import('@/pages/account/AccountLicensesPage').then((m) => ({ default: m.AccountLicensesPage })),
)
const AccountDownloadsPage = lazy(() =>
  import('@/pages/account/AccountDownloadsPage').then((m) => ({ default: m.AccountDownloadsPage })),
)
const AccountProfilePage = lazy(() =>
  import('@/pages/account/AccountProfilePage').then((m) => ({ default: m.AccountProfilePage })),
)
const AccountBillingPage = lazy(() =>
  import('@/pages/account/AccountBillingPage').then((m) => ({ default: m.AccountBillingPage })),
)
const AccountSecurityPage = lazy(() =>
  import('@/pages/account/AccountSecurityPage').then((m) => ({ default: m.AccountSecurityPage })),
)
const AccountSupportPage = lazy(() =>
  import('@/pages/account/AccountSupportPage').then((m) => ({ default: m.AccountSupportPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminBuilderPage = lazy(() =>
  import('@/pages/admin/AdminBuilderPage').then((m) => ({ default: m.AdminBuilderPage })),
)
const BuilderSavedPreviewPage = lazy(() =>
  import('@/pages/admin/BuilderSavedPreviewPage').then((m) => ({ default: m.BuilderSavedPreviewPage })),
)
const AdminProductListPage = lazy(() =>
  import('@/pages/admin/AdminProductListPage').then((m) => ({ default: m.AdminProductListPage })),
)
const AdminProductFormPage = lazy(() =>
  import('@/pages/admin/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })),
)
const AdminCampaignListPage = lazy(() =>
  import('@/pages/admin/AdminCampaignListPage').then((m) => ({ default: m.AdminCampaignListPage })),
)
const AdminCampaignFormPage = lazy(() =>
  import('@/pages/admin/AdminCampaignFormPage').then((m) => ({ default: m.AdminCampaignFormPage })),
)
const AdminMediaLibraryPage = lazy(() =>
  import('@/pages/admin/AdminMediaLibraryPage').then((m) => ({ default: m.AdminMediaLibraryPage })),
)
const AdminSiteSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSiteSettingsPage').then((m) => ({ default: m.AdminSiteSettingsPage })),
)
const AdminPaymentSettingsPage = lazy(() =>
  import('@/pages/admin/AdminPaymentSettingsPage').then((m) => ({ default: m.AdminPaymentSettingsPage })),
)
const AdminEmailSettingsPage = lazy(() =>
  import('@/pages/admin/AdminEmailSettingsPage').then((m) => ({ default: m.AdminEmailSettingsPage })),
)
const AdminAppearanceSettingsPage = lazy(() =>
  import('@/pages/admin/AdminAppearanceSettingsPage').then((m) => ({ default: m.AdminAppearanceSettingsPage })),
)
const AdminUserSettingsPage = lazy(() =>
  import('@/pages/admin/AdminUserSettingsPage').then((m) => ({ default: m.AdminUserSettingsPage })),
)
const AdminAnalyticsSettingsPage = lazy(() =>
  import('@/pages/admin/AdminAnalyticsSettingsPage').then((m) => ({ default: m.AdminAnalyticsSettingsPage })),
)
const AdminSettingsLayout = lazy(() =>
  import('@/layouts/AdminSettingsLayout').then((m) => ({ default: m.AdminSettingsLayout })),
)
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
)
const AdminOrderDetailPage = lazy(() =>
  import('@/pages/admin/AdminOrderDetailPage').then((m) => ({ default: m.AdminOrderDetailPage })),
)
const AdminPaymentsPage = lazy(() =>
  import('@/pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })),
)

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>
}

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <LazyPage><HomePage /></LazyPage> },
      { path: 'hakkimizda', element: <LazyPage><AboutPage /></LazyPage> },
      { path: 'hizmetler', element: <LazyPage><ServicesPage /></LazyPage> },
      { path: 'hizmetler/:slug', element: <LazyPage><ServiceDetailPage /></LazyPage> },
      {
        path: 'hizmetler/e-ticaret-cozumleri',
        element: <Navigate to="/hizmetler/e-ticaret" replace />,
      },
      {
        path: 'hizmetler/saas-urun-gelistirme',
        element: <Navigate to="/hizmetler/saas" replace />,
      },
      { path: 'cozumler', element: <LazyPage><SolutionsPage /></LazyPage> },
      { path: 'cozumler/:slug', element: <LazyPage><SolutionDetailPage /></LazyPage> },
      { path: 'yazilimlar', element: <LazyPage><SoftwareListPage /></LazyPage> },
      { path: 'yazilimlar/:slug', element: <LazyPage><SoftwareDetailPage /></LazyPage> },
      { path: 'blog', element: <LazyPage><BlogListPage /></LazyPage> },
      { path: 'blog/:slug', element: <LazyPage><BlogDetailPage /></LazyPage> },
      { path: 'iletisim', element: <LazyPage><ContactPage /></LazyPage> },
      { path: 'sepet', element: <LazyPage><CartPage /></LazyPage> },
      { path: 'odeme', element: <LazyPage><CheckoutPage /></LazyPage> },
      { path: 'odeme/basarili', element: <LazyPage><PaymentSuccessPage /></LazyPage> },
      { path: 'odeme/basarili/:orderNo', element: <LazyPage><PaymentSuccessPage /></LazyPage> },
      { path: 'odeme/basarisiz', element: <LazyPage><PaymentFailPage /></LazyPage> },
      { path: 'odeme/basarisiz/:orderNo', element: <LazyPage><PaymentFailPage /></LazyPage> },
      { path: 'yasal/:slug', element: <LazyPage><LegalDocumentPage /></LazyPage> },
      { path: 'yasal-belge/:type', element: <LazyPage><LegalTypeDocumentPage /></LazyPage> },
      { path: 'cerez-politikasi', element: <LazyPage><CookiePolicyPage /></LazyPage> },
      { path: 'yasal/cerez-politikasi', element: <Navigate to="/cerez-politikasi" replace /> },
      { path: 'kvkk-aydinlatma-metni', element: <LazyPage><KvkkPage /></LazyPage> },
      { path: 'yasal/kvkk-aydinlatma-metni', element: <LazyPage><KvkkPage /></LazyPage> },
      { path: 'gizlilik-politikasi', element: <LazyPage><PrivacyPage /></LazyPage> },
      { path: 'yasal/gizlilik-politikasi', element: <LazyPage><PrivacyPage /></LazyPage> },
      { path: 'acik-riza-metni', element: <LazyPage><AcikRizaMetniPage /></LazyPage> },
      { path: 'yasal/acik-riza-metni', element: <LazyPage><AcikRizaMetniPage /></LazyPage> },
      { path: 'kullanim-sartlari', element: <LazyPage><KullanimSartlariPage /></LazyPage> },
      { path: 'yasal/kullanim-sartlari', element: <LazyPage><KullanimSartlariPage /></LazyPage> },
      { path: 'iade-iptal-kosullari', element: <LazyPage><RefundPolicyPage /></LazyPage> },
      { path: 'yasal/iade-iptal-kosullari', element: <LazyPage><RefundPolicyPage /></LazyPage> },
      { path: 'mesafeli-satis-sozlesmesi', element: <LazyPage><MesafeliSatisSozlesmesiPage /></LazyPage> },
      { path: 'yasal/mesafeli-satis-sozlesmesi', element: <LazyPage><MesafeliSatisSozlesmesiPage /></LazyPage> },
      { path: 'on-bilgilendirme-formu', element: <LazyPage><OnBilgilendirmeFormuPage /></LazyPage> },
      { path: 'yasal/on-bilgilendirme-formu', element: <LazyPage><OnBilgilendirmeFormuPage /></LazyPage> },
      { path: 'giris', element: <LazyPage><CustomerLoginPage /></LazyPage> },
      { path: 'kayit', element: <LazyPage><CustomerRegisterPage /></LazyPage> },
      { path: 'sifremi-unuttum', element: <LazyPage><ForgotPasswordPage /></LazyPage> },
      { path: 'sifre-sifirla', element: <LazyPage><ResetPasswordPage /></LazyPage> },
      {
        element: <CustomerGuard />,
        children: [
          {
            path: 'hesabim',
            element: <AccountLayout />,
            children: [
              { index: true, element: <LazyPage><AccountDashboardPage /></LazyPage> },
              { path: 'siparisler', element: <LazyPage><AccountOrdersPage /></LazyPage> },
              { path: 'siparisler/:orderNo', element: <LazyPage><AccountOrderDetailPage /></LazyPage> },
              { path: 'lisanslar', element: <LazyPage><AccountLicensesPage /></LazyPage> },
              { path: 'indirmeler', element: <LazyPage><AccountDownloadsPage /></LazyPage> },
              { path: 'profil', element: <LazyPage><AccountProfilePage /></LazyPage> },
              { path: 'fatura', element: <LazyPage><AccountBillingPage /></LazyPage> },
              { path: 'guvenlik', element: <LazyPage><AccountSecurityPage /></LazyPage> },
              { path: 'destek', element: <LazyPage><AccountSupportPage /></LazyPage> },
            ],
          },
        ],
      },
      { path: '*', element: <LazyPage><NotFoundPage /></LazyPage> },
    ],
  },
  {
    path: 'admin/giris',
    element: (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <LazyPage>
          <LoginPage />
        </LazyPage>
      </div>
    ),
  },
  {
    element: <AdminGuard />,
    children: [
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <LazyPage><AdminDashboardPage /></LazyPage> },
          { path: 'orders', element: <LazyPage><AdminOrdersPage /></LazyPage> },
          { path: 'orders/:id', element: <LazyPage><AdminOrderDetailPage /></LazyPage> },
          { path: 'payments', element: <LazyPage><AdminPaymentsPage /></LazyPage> },
          { path: 'builder', element: <LazyPage><AdminBuilderPage /></LazyPage> },
          { path: 'builder-preview', element: <LazyPage><BuilderSavedPreviewPage /></LazyPage> },
          { path: 'products', element: <LazyPage><AdminProductListPage /></LazyPage> },
          { path: 'products/new', element: <LazyPage><AdminProductFormPage /></LazyPage> },
          { path: 'products/:id/edit', element: <LazyPage><AdminProductFormPage /></LazyPage> },
          { path: 'campaigns', element: <LazyPage><AdminCampaignListPage /></LazyPage> },
          { path: 'campaigns/new', element: <LazyPage><AdminCampaignFormPage /></LazyPage> },
          { path: 'campaigns/:id/edit', element: <LazyPage><AdminCampaignFormPage /></LazyPage> },
          { path: 'media', element: <LazyPage><AdminMediaLibraryPage /></LazyPage> },
          {
            path: 'settings',
            element: (
              <LazyPage>
                <AdminSettingsLayout />
              </LazyPage>
            ),
            children: [
              { index: true, element: <Navigate to="site" replace /> },
              { path: 'site', element: <LazyPage><AdminSiteSettingsPage /></LazyPage> },
              { path: 'analytics', element: <LazyPage><AdminAnalyticsSettingsPage /></LazyPage> },
              { path: 'payment', element: <LazyPage><AdminPaymentSettingsPage /></LazyPage> },
              { path: 'email', element: <LazyPage><AdminEmailSettingsPage /></LazyPage> },
              { path: 'appearance', element: <LazyPage><AdminAppearanceSettingsPage /></LazyPage> },
              { path: 'users', element: <LazyPage><AdminUserSettingsPage /></LazyPage> },
            ],
          },
        ],
      },
    ],
  },
    ],
  },
])
