"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useStore } from "@/context/StoreContext";

type Language = "en" | "hi";

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    pos: "POS / Billing",
    inventory: "Inventory",
    customers: "Customers",
    settings: "Settings",
    search: "Search...",
    total_sales: "Total Sales",
    orders_today: "Orders Today",
    top_products: "Top Products",
    add_product: "Add Product",
    add_customer: "Add Customer",
    checkout: "Checkout",
    total: "Total",
    tax: "Tax",
    discount: "Discount",
    final_amount: "Final Amount",
    cart: "Cart",
    empty_cart: "Cart is empty",
    product_name: "Product Name",
    price: "Price",
    stock: "Stock",
    category: "Category",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    generate_bill: "Generate Bill",
    invoice: "Invoice",
    pay: "Pay",
    print: "Print",
    payment_method: "Payment Method",
    cash: "Cash",
    card: "Card",
    upi: "UPI",
    sales_trend: "Sales Trend",
    recent_transactions: "Recent Transactions",
    no_data: "No data available",
    success: "Success!",
    error: "Error occurred",
    product_added: "Product added successfully",
    product_updated: "Product updated successfully",
    product_deleted: "Product deleted successfully",
    customer_name: "Customer Name",
    phone: "Phone",
    email: "Email",
    logout: "Logout",
    app_title: "UdyogSetu"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    pos: "पीओएस / बिलिंग",
    inventory: "इन्वेंटरी (स्टॉक)",
    customers: "ग्राहक",
    settings: "सेटिंग्स",
    search: "खोजें...",
    total_sales: "कुल बिक्री",
    orders_today: "आज के ऑर्डर",
    top_products: "शीर्ष उत्पाद",
    add_product: "उत्पाद जोड़ें",
    add_customer: "ग्राहक जोड़ें",
    checkout: "चेकआउट",
    total: "कुल",
    tax: "कर (Tax)",
    discount: "छूट (Discount)",
    final_amount: "अंतिम राशि",
    cart: "गाड़ी (Cart)",
    empty_cart: "कार्ट खाली है",
    product_name: "उत्पाद का नाम",
    price: "मूल्य",
    stock: "स्टॉक",
    category: "श्रेणी",
    actions: "कार्रवाई",
    edit: "संपादित करें",
    delete: "हटाएं",
    save: "सहेजें",
    cancel: "रद्द करें",
    generate_bill: "बिल जेनरेट करें",
    invoice: "चालान (Invoice)",
    pay: "भुगतान करें",
    print: "प्रिंट करें",
    payment_method: "भुगतान का प्रकार",
    cash: "नकद",
    card: "कार्ड",
    upi: "यूपीआई",
    sales_trend: "बिक्री का चलन",
    recent_transactions: "हाल के लेनदेन",
    no_data: "कोई डेटा उपलब्ध नहीं है",
    success: "सफलता!",
    error: "त्रुटि हुई",
    product_added: "उत्पाद सफलतापूर्वक जोड़ा गया",
    product_updated: "उत्पाद सफलतापूर्वक अपडेट किया गया",
    product_deleted: "उत्पाद सफलतापूर्वक हटा दिया गया",
    customer_name: "ग्राहक का नाम",
    phone: "फ़ोन",
    email: "ईमेल",
    logout: "लॉग आउट",
    app_title: "उद्योगसेतु"
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");
  const { profile } = useStore();

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key: string): string => {
    let text = translations[language][key] || key;
    const category = profile?.category || "";

    if (language === "en") {
      if (category === "Bakery") {
        if (key === "inventory") return "Cakes / Inventory";
        if (key === "add_product") return "Add Cake";
        if (key === "top_products") return "Top Cakes";
        if (key === "product_name") return "Cake Name";
      } else if (category === "Restaurant") {
        if (key === "inventory") return "Menu Items";
        if (key === "add_product") return "Add Dish";
        if (key === "top_products") return "Top Dishes";
        if (key === "product_name") return "Dish Name";
      } else if (category === "Salon") {
        if (key === "inventory") return "Services";
        if (key === "add_product") return "Add Service";
        if (key === "top_products") return "Top Services";
        if (key === "product_name") return "Service Name";
      } else if (category === "Medical") {
        if (key === "inventory") return "Pharmacy Stock";
        if (key === "add_product") return "Add Medicine";
        if (key === "top_products") return "Top Medicines";
        if (key === "product_name") return "Medicine Name";
      } else if (category === "Book Shop") {
        if (key === "inventory") return "Books Inventory";
        if (key === "add_product") return "Add Book";
        if (key === "top_products") return "Top Books";
        if (key === "product_name") return "Book Title";
      }
    } else if (language === "hi") {
      if (category === "Restaurant") {
        if (key === "inventory") return "मेनू आइटम";
        if (key === "add_product") return "डिश जोड़ें";
        if (key === "top_products") return "शीर्ष व्यंजन";
        if (key === "product_name") return "डिश का नाम";
      }
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
