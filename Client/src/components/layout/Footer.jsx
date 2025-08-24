import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { ROUTES } from "@/utils/constant";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SilentVoice</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              A platform for sharing ideas, stories, and knowledge. Write, read,
              and connect with fellow bloggers from around the world.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/SilentVoice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/SilentVoice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/SilentVoice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@SilentVoice.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={ROUTES.HOME}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CREATE_BLOG}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Write a Blog
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.ABOUT}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CONTACT}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.HELP}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={ROUTES.PRIVACY}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.TERMS}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.COOKIES}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.GDPR}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GDPR Rights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SilentVoice. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for the blogging community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};



//good to go 