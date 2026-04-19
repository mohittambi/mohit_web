"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Calendar, BookOpen, Send, Mail, Phone } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE_E164, CONTACT_PHONE_LABEL, CONTACT_WHATSAPP_URL } from "@/data/blog/site";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const [sent, setSent] = useState(false);

  const onSubmit = (data: FormData) => {
    const subject = encodeURIComponent(`Message from ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    globalThis.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    reset();
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="py-24 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader label="Contact" title="Let's build something worth building." />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: quick actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Schedule Call */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <Calendar size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)] text-sm">Schedule a Call</h3>
                </div>
              </div>
              <a
                href="https://calendly.com/er-mohittambi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Open Calendar <Calendar size={14} />
              </a>
            </div>

            {/* Mobile + email */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-6 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-[var(--accent)]" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--text)] text-sm">Mobile</h3>
                    <p className="text-sm text-[var(--text)] tabular-nums">{CONTACT_PHONE_LABEL}</p>
                  </div>
                </div>
                <a
                  href={`tel:${CONTACT_PHONE_E164}`}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-[var(--border-color)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors shrink-0 sm:self-center w-full sm:w-auto"
                >
                  Call or text <Phone size={14} aria-hidden />
                </a>
              </div>

              <div className="border-t border-[var(--border-color)]" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/15">
                    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-[#25D366]">
                      <path
                        fill="currentColor"
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--text)] text-sm">WhatsApp</h3>
                    <p className="text-sm text-[var(--text)] tabular-nums">{CONTACT_PHONE_LABEL}</p>
                  </div>
                </div>
                <a
                  href={CONTACT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-md border border-[#25D366]/35 bg-[#25D366]/10 px-4 text-sm font-medium text-[#0d5c3d] transition-colors hover:bg-[#25D366]/18 dark:border-[#25D366]/45 dark:bg-[#25D366]/12 dark:text-[#86efac] sm:w-auto"
                >
                  Chat on WhatsApp
                </a>
              </div>

              <div className="border-t border-[var(--border-color)]" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-[var(--accent)]" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--text)] text-sm">Email</h3>
                    <p className="text-sm text-[var(--text)] break-all">{CONTACT_EMAIL}</p>
                  </div>
                </div>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-[var(--border-color)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors shrink-0 sm:self-center w-full sm:w-auto"
                >
                  Send email <Mail size={14} aria-hidden />
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-6">
              <h3 className="font-semibold text-[var(--text)] text-sm mb-4">Find me on</h3>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: LinkedinIcon,
                    label: "LinkedIn",
                    url: "https://www.linkedin.com/in/mohit-tambi/",
                    handle: "/in/mohit-tambi",
                  },
                  {
                    icon: GithubIcon,
                    label: "GitHub",
                    url: "https://github.com/mohittambi",
                    handle: "mohittambi",
                  },
                  {
                    icon: BookOpen,
                    label: "Medium",
                    url: "https://medium.com/@er.mohittambi",
                    handle: "@er.mohittambi",
                  },
                ].map(({ icon: Icon, label, url, handle }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    <Icon size={16} />
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-[var(--muted)] ml-auto">{handle}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-6 sm:p-8">
              <h3 className="font-semibold text-[var(--text)] mb-6">Send a message</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Name
                  </label>
                  <input
                    {...register("name", { required: true })}
                    placeholder="Your name"
                    className="w-full h-10 px-3 rounded-md border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">Name is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Email
                  </label>
                  <input
                    {...register("email", {
                      required: true,
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    })}
                    placeholder="your@email.com"
                    type="email"
                    className="w-full h-10 px-3 rounded-md border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">Valid email required</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Message
                  </label>
                  <textarea
                    {...register("message", { required: true })}
                    placeholder="What are you working on? What problem needs solving?"
                    rows={5}
                    className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">Message is required</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  {sent ? "Opening email client..." : (
                    <>
                      Send Message <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
