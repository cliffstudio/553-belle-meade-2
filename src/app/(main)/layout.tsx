import '@/styles/style.scss'
import { getFooterSettings, getLeftMenu, getRightMenu } from '../../utils/footerSettings'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LazyLoadInitializer from '../../components/LazyLoadInitializer'
import MainWrapper from '../../components/MainWrapper'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [footerSettings, leftMenu, rightMenu] = await Promise.all([
    getFooterSettings(),
    getLeftMenu(),
    getRightMenu()
  ])

  return (
    <>
      <LazyLoadInitializer />
      {(leftMenu || rightMenu) && <Header leftMenu={leftMenu || undefined} rightMenu={rightMenu || undefined} />}
      <MainWrapper>{children}</MainWrapper>
      {footerSettings && <Footer footer={footerSettings} />}
    </>
  )
}
