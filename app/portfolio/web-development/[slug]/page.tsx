import PortfolioProjectDetailPage from "../../project-detail-client";

export default async function WebDevelopmentProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PortfolioProjectDetailPage category="Websites" slug={slug} />;
}
