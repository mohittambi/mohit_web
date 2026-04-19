# Blog comments

Two options are supported on each post (`/blog/[slug]`):

## 1. Giscus (public GitHub Discussions threads)

When environment variables are set at build time, the post footer loads [Giscus](https://giscus.app/) so visitors can comment with a GitHub account.

1. Install the Giscus app on your repo and enable Discussions.
2. Use [giscus.app](https://giscus.app/) to generate `data-repo-id` and `data-category-id`.
3. Set in `.env.local` (and in Vercel project settings for production):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_GISCUS_REPO` | `yourname/yourrepo` |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | From giscus.app |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | From giscus.app |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | Optional; default `Announcements` |

Rebuild after changing env vars.

## 2. Email feedback (always available if Giscus is not configured)

If the Giscus variables are missing, the UI shows a short form that opens the visitor’s mail client with **subject** and **body** prefilled. Long bodies may be truncated for `mailto:` URL limits—users can paste more in the email itself.

---

*Contact address is also defined as `CONTACT_EMAIL` in `data/blog/site.ts` (align with `app/layout.tsx` JSON-LD).*
