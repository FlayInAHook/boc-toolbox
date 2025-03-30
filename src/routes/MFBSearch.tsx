import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/MFBSearch')({
  component: MfbSearch,
})

function MfbSearch() {
  return <div className="p-2">Hello from MfbSearch!</div>
}