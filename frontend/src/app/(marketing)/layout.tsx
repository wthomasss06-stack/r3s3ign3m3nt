import Footer from "@/components/marketing/Footer";
import Header from "@/components/marketing/Header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="site-main-offset">{children}</main>
      <Footer />
    </div>
  );
}
