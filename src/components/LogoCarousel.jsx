"use client";
import { motion } from "framer-motion";
const logos = [
  { src: "/logo/rodobens.png", alt: "Rodobens" },
  { src: "/logo/embracon.jpg", alt: "Embracon" },
  { src: "/logo/magalu.png", alt: "Magalu" },
  { src: "/logo/hs.png", alt: "HS Consórcios" },
  { src: "/logo/itau.jpg", alt: "Itaú" },
  { src: "/logo/porto.png", alt: "Porto Seguro" },
  { src: "/logo/bbconsorcio.png", alt: "BB Consórcios" },
  { src: "/logo/ademicon.png", alt: "Ademicon" },
  { src: "/logo/mycon.png", alt: "Mycon" },
];
export default function LogoCarousel() {
  return (
    <div className="overflow-hidden w-full h-16 bg-white">
      <motion.div
        className="flex items-center gap-10 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
      >
        {[...logos, ...logos, ...logos].map((logo, index) => (
          <div key={index} className="flex-shrink-0">
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-12 w-auto object-contain"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}