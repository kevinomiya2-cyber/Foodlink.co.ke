import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FoodLink | One Network. Every Plate.',
  description: 'Discover great food, book chefs, source ingredients, and connect with delivery partners through FoodLink Kenya.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
