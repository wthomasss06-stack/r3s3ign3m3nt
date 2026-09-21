import Footer from "@/components/marketing/Footer";
import Header from "@/components/marketing/Header";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="pt-[72px]">{children}</main>
      <Footer />
      <FeedbackWidget />
    </div>
  );
}
