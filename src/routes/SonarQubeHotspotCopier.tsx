import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/SonarQubeHotspotCopier')({
  component: SonarqubeHotspotCopier,
})

function SonarqubeHotspotCopier() {
  return <div className="p-2">Hello from SonarqubeHotspotCopier!</div>
}