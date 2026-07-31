export type Vehicle = {
  id: number;
  brand: string;
  model: string;
  version: string;
  price: number;
  year: number;
  km: number;
  color: string;
  transmission: string;
  fuel: string;
  image: string;
  featured: boolean;
};

export const defaultVehicles: Vehicle[] = [
  { id: 5229310, brand: "BYD", model: "Song Plus", version: "1.5 DM-i Turbo Híbrido Automático", price: 249900, year: 2027, km: 22, color: "Cinza", transmission: "Automático", fuel: "Híbrido", image: "/images/vehicles/db73d979516de8f7.jpg", featured: true },
  { id: 4720344, brand: "Chevrolet", model: "Onix", version: "1.0 Turbo Flex Premier Automático", price: 69900, year: 2021, km: 85000, color: "Prata", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/ac7b7c98927e3df8.jpg", featured: false },
  { id: 5096757, brand: "Chevrolet", model: "Tracker", version: "1.8 MPFI LTZ 4x2 16V Flex", price: 67500, year: 2015, km: 69037, color: "Preto", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/cb029c74c8944e84.jpg", featured: false },
  { id: 5223226, brand: "Fiat", model: "Toro", version: "1.3 Turbo 270 Flex Volcano AT6", price: 116900, year: 2022, km: 56043, color: "Cinza", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/ca11de2e0ac08433.jpg", featured: true },
  { id: 5245147, brand: "Ford", model: "Fiesta", version: "1.0 Rocam SE Plus 8V Flex", price: 36900, year: 2014, km: 69200, color: "Preto", transmission: "Manual", fuel: "Flex", image: "/images/vehicles/97811ebb5fd10807.jpg", featured: false },
  { id: 4622842, brand: "Honda", model: "CB 300F Twister", version: "ABS", price: 28500, year: 2026, km: 0, color: "Vermelho", transmission: "Manual", fuel: "Flex", image: "/images/vehicles/a486a30f46b112ab.jpg", featured: false },
  { id: 5248602, brand: "Honda", model: "HR-V", version: "1.5 DI i-VTEC Turbo Touring CVT", price: 158600, year: 2024, km: 39059, color: "Cinza", transmission: "CVT", fuel: "Flex", image: "/images/vehicles/becee35006878473.jpg", featured: true },
  { id: 4131667, brand: "Honda", model: "HR-V", version: "1.8 16V Flex EX 4P", price: 93800, year: 2018, km: 92295, color: "Cinza", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/4d7e52ea526cdcb6.jpg", featured: false },
  { id: 5157746, brand: "Honda", model: "NXR 160 Bros", version: "ESDD", price: 17600, year: 2019, km: 47500, color: "Preto", transmission: "Manual", fuel: "Flex", image: "/images/vehicles/394062b99f9418c8.jpg", featured: false },
  { id: 5134777, brand: "Honda", model: "PCX 150", version: "PCX 150", price: 12900, year: 2015, km: 58600, color: "Preto", transmission: "Manual", fuel: "Gasolina", image: "/images/vehicles/37953dd311cdf942.jpg", featured: false },
  { id: 5167520, brand: "Honda", model: "Pop 110i", version: "Pop 110i", price: 11500, year: 2024, km: 67256, color: "Vermelho", transmission: "Manual", fuel: "Flex", image: "/images/vehicles/77e8a8c08444ca8e.jpg", featured: false },
  { id: 5259464, brand: "Hyundai", model: "Creta", version: "1.6 16V Flex Action", price: 89900, year: 2022, km: 67300, color: "Branco", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/21586333b91e57b7.jpg", featured: true },
  { id: 5205895, brand: "Jeep", model: "Renegade", version: "1.8 16V Flex Sport 4P", price: 69000, year: 2018, km: 65711, color: "Cinza", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/ef3adedc7e128588.jpg", featured: false },
  { id: 4825836, brand: "Jeep", model: "Renegade", version: "1.8 16V Flex Limited 4P", price: 93500, year: 2021, km: 89800, color: "Cinza", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/c0c56214b959297b.jpg", featured: false },
  { id: 4595705, brand: "Land Rover", model: "Discovery", version: "3.0 V6 TD6 Diesel HSE 4WD", price: 259000, year: 2019, km: 74159, color: "Preto", transmission: "Automático", fuel: "Diesel", image: "/images/vehicles/4c3a262ec9e2297f.jpg", featured: true },
  { id: 5200771, brand: "Mercedes-Benz", model: "C 300", version: "2.0 CGI Sport 9G-Tronic", price: 221000, year: 2019, km: 42656, color: "Branco", transmission: "Automático", fuel: "Gasolina", image: "/images/vehicles/5833b65d0956b5d7.jpg", featured: true },
  { id: 5207758, brand: "Mitsubishi", model: "ASX", version: "2.0 4x2 16V Flex 4P", price: 82600, year: 2018, km: 89000, color: "Branco", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/8ee581cfad045ab3.jpg", featured: false },
  { id: 5180357, brand: "Nissan", model: "Kicks", version: "1.6 16V Flexstart Sense Xtronic", price: 103900, year: 2024, km: 24587, color: "Vermelho", transmission: "CVT", fuel: "Flex", image: "/images/vehicles/8e94339a46c5d182.jpg", featured: false },
  { id: 5202135, brand: "Nissan", model: "Versa", version: "1.0 12V Flex 4P", price: 57900, year: 2020, km: 26174, color: "Prata", transmission: "Manual", fuel: "Flex", image: "/images/vehicles/1b0dd0b50471d812.jpg", featured: false },
  { id: 5157104, brand: "Toyota", model: "Corolla Cross", version: "1.8 VVT-i Hybrid Flex XRX CVT", price: 171900, year: 2024, km: 35582, color: "Branco", transmission: "Automático", fuel: "Híbrido", image: "/images/vehicles/5473c686f14d8753.jpg", featured: false },
  { id: 4450683, brand: "Volkswagen", model: "Kombi", version: "1.6 MI Pick-up CS 8V 2P", price: 49900, year: 1979, km: 64733, color: "Bege", transmission: "Manual", fuel: "Gasolina", image: "/images/vehicles/1317fcc1da77448e.jpg", featured: false },
  { id: 5160813, brand: "Volkswagen", model: "Polo", version: "1.0 200 TSI Highline", price: 83900, year: 2020, km: 64833, color: "Azul", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/32e559373a07ea18.jpg", featured: false },
  { id: 4472010, brand: "Volkswagen", model: "Saveiro", version: "1.6 MSI Extreme CD 16V 2P", price: 106900, year: 2025, km: 31677, color: "Cinza", transmission: "Manual", fuel: "Flex", image: "/images/vehicles/58929f8b6d19eebf.jpg", featured: false },
  { id: 5190539, brand: "Volkswagen", model: "T-Cross", version: "1.0 200 TSI Comfortline", price: 98700, year: 2022, km: 63636, color: "Preto", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/4e7fd36e639bb92b.jpg", featured: false },
  { id: 5057865, brand: "Volkswagen", model: "Virtus", version: "1.0 200 TSI Comfortline", price: 108900, year: 2025, km: 28383, color: "Branco", transmission: "Automático", fuel: "Flex", image: "/images/vehicles/30a578d50868264b.jpg", featured: false },
];
