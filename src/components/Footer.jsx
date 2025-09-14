import React from "react";
import { APP_VERSION } from "../version";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-600 text-sm px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <span>Trackviso</span>
        <span>Version {APP_VERSION}</span>
      </div>
    </footer>
  );
};

export default Footer;
