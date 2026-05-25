import PortfolioProjectDetailPage from "../../project-detail-client";

export default async function VideoEditingProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PortfolioProjectDetailPage category="Video Edit" slug={slug} />;
}
