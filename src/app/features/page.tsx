import { redirect } from 'next/navigation'

/**
 * The feature catalogue lives on the landing page now ('/#features').
 * This route stays as a redirect so old links and the nav "Features" entry
 * land on the same scrollable section instead of a separate page.
 */
export default function FeaturesRoute() {
  redirect('/#features')
}
