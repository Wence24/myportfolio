import PortfolioProjectDetailPage from "../../project-detail-client";

export default async function GraphicDesignProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PortfolioProjectDetailPage category="Graphic Design" slug={slug} />;
}
