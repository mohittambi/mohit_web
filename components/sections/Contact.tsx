"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Mail, Calendar, BookOpen, Send } from "lucide-react";
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
    window.location.href = `mailto:er.mohittambi@gmail.com?subject=${subject}&body=${body}`;
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
          <SectionHeader
            label="Contact"
            title="Let's build something worth building."
            description="Prefer a quick call? Use the scheduler. Have context to share first? The form works too."
          />
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
                  <p className="text-xs text-[var(--muted)]">30-min intro / technical discussion</p>
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

            {/* Email */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <Mail size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)] text-sm">Email</h3>
                  <p className="text-xs text-[var(--muted)]">er.mohittambi@gmail.com</p>
                </div>
              </div>
              <a
                href="mailto:er.mohittambi@gmail.com"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-[var(--border-color)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
              >
                Send Email <Mail size={14} />
              </a>
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
