import { Header } from "@/components/common/Header";
import { ReactNode } from "react"

type IDashboardLayoutProps = {
  children: ReactNode;
}

export const metadata = {
  title: 'Translations App',
  description: 'This is help us to translating our apps',
};

export default function DashboardLayout({ children }: IDashboardLayoutProps) {
  return (
    <>
      <Header />

      <div style={{ padding: '50px' }}>
        {children}
      </div>
    </>
  )
}