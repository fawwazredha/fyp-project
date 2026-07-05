// Clinic & hospital data for the "Find a Clinic" feature.
// Data source: © OpenStreetMap contributors (when regenerated via the Overpass API).
// This initial version was seeded from the project's original dataset.
// To expand it with all hospitals/clinics in Malaysia, run: python fetch_clinics.py
// (that script overwrites this file).

export interface Clinic {
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'clinic' | 'hospital';
  district?: string;
}

export const CLINICS_DATA: Record<string, Clinic[]> = {
  Johor: [
    { name: 'Hospital Sultanah Aminah', address: 'Jalan Persiaran Abu Bakar Sultan, Johor Bahru', lat: 1.4655, lng: 103.7578, type: 'hospital', district: 'Johor Bahru' },
    { name: 'KPJ Johor Specialist Hospital', address: 'Jalan Abdul Samad, Johor Bahru', lat: 1.4607, lng: 103.7470, type: 'hospital', district: 'Johor Bahru' },
    { name: 'Klinik Kesihatan Johor Bahru', address: 'Jalan Trus, Johor Bahru', lat: 1.4627, lng: 103.7473, type: 'clinic', district: 'Johor Bahru' },
    { name: 'Columbia Asia Hospital Tebrau', address: 'Jalan Harmonium, Tebrau', lat: 1.5316, lng: 103.7647, type: 'hospital', district: 'Johor Bahru' },
    { name: 'Gleneagles Hospital Medini', address: 'Medini Iskandar Puteri, Johor', lat: 1.4267, lng: 103.6318, type: 'hospital', district: 'Johor Bahru' },
    { name: 'Hospital Sultan Ismail', address: 'Jalan Mutiara Emas Utama, Johor Bahru', lat: 1.5584, lng: 103.7998, type: 'hospital', district: 'Johor Bahru' },
  ],

  Selangor: [
    { name: 'Hospital Tengku Ampuan Rahimah', address: 'Jalan Langat, Klang', lat: 3.0413, lng: 101.4441, type: 'hospital', district: 'Klang' },
    { name: 'Sunway Medical Centre', address: 'Jalan Lagoon Selatan, Subang Jaya', lat: 3.0670, lng: 101.6039, type: 'hospital', district: 'Subang Jaya' },
    { name: 'Klinik Kesihatan Shah Alam', address: 'Seksyen 7, Shah Alam', lat: 3.0733, lng: 101.5185, type: 'clinic', district: 'Shah Alam' },
    { name: 'Hospital Shah Alam', address: 'Persiaran Kayangan, Shah Alam', lat: 3.0890, lng: 101.5327, type: 'hospital', district: 'Shah Alam' },
    { name: 'Beacon Hospital', address: 'Petaling Jaya, Selangor', lat: 3.1127, lng: 101.6393, type: 'hospital', district: 'Petaling Jaya' },
    { name: 'Columbia Asia Hospital Klang', address: 'Bandar Bukit Tinggi, Klang', lat: 3.0092, lng: 101.4460, type: 'hospital', district: 'Klang' },
    { name: 'Hospital Serdang', address: 'Jalan Puchong, Kajang', lat: 2.9765, lng: 101.7182, type: 'hospital', district: 'Kajang' },
  ],

  'Kuala Lumpur': [
    { name: 'Hospital Kuala Lumpur', address: 'Jalan Pahang, Kuala Lumpur', lat: 3.1700, lng: 101.7010, type: 'hospital', district: 'Titiwangsa' },
    { name: 'Pantai Hospital KL', address: 'Jalan Bukit Pantai, Kuala Lumpur', lat: 3.1178, lng: 101.6714, type: 'hospital', district: 'Bangsar' },
    { name: 'KL General Hospital (HUKM)', address: 'Jalan Yaacob Latif, Cheras', lat: 3.0604, lng: 101.7309, type: 'hospital', district: 'Cheras' },
    { name: 'Klinik Kesihatan Jalan Ipoh', address: 'Jalan Ipoh, Kuala Lumpur', lat: 3.1699, lng: 101.6866, type: 'clinic', district: 'Kepong' },
    { name: 'Prince Court Medical Centre', address: 'Jalan Kia Peng, Kuala Lumpur', lat: 3.1525, lng: 101.7152, type: 'hospital', district: 'Titiwangsa' },
    { name: 'KPJ Sentosa KL Specialist Hospital', address: 'Jalan Chemur, Kuala Lumpur', lat: 3.1741, lng: 101.6942, type: 'hospital', district: 'Titiwangsa' },
  ],

  Penang: [
    { name: 'Hospital Pulau Pinang', address: 'Residensi Road, Georgetown', lat: 5.4083, lng: 100.3225, type: 'hospital', district: 'Georgetown' },
    { name: 'Gleneagles Hospital Penang', address: 'Jalan Pangkor, Georgetown', lat: 5.4257, lng: 100.3161, type: 'hospital', district: 'Georgetown' },
    { name: 'Klinik Kesihatan Georgetown', address: 'Jalan Masjid Melayu, Georgetown', lat: 5.4167, lng: 100.3321, type: 'clinic', district: 'Georgetown' },
    { name: 'Island Hospital', address: 'Jalan Macalister, Georgetown', lat: 5.4146, lng: 100.3185, type: 'hospital', district: 'Georgetown' },
    { name: 'Penang Adventist Hospital', address: 'Jalan Burma, Georgetown', lat: 5.4310, lng: 100.3092, type: 'hospital', district: 'Georgetown' },
  ],

  Perak: [
    { name: 'Hospital Raja Permaisuri Bainun', address: 'Jalan Raja Ashman Shah, Ipoh', lat: 4.5897, lng: 101.0810, type: 'hospital', district: 'Ipoh' },
    { name: 'Fatimah Hospital', address: 'Jalan Dato Lau Pak Khuan, Ipoh', lat: 4.5969, lng: 101.0741, type: 'hospital', district: 'Ipoh' },
    { name: 'Klinik Kesihatan Ipoh', address: 'Jalan Tun Abdul Razak, Ipoh', lat: 4.5975, lng: 101.0901, type: 'clinic', district: 'Ipoh' },
    { name: 'KPJ Ipoh Specialist Hospital', address: 'Jalan Raja Dihilir, Ipoh', lat: 4.5923, lng: 101.0905, type: 'hospital', district: 'Ipoh' },
  ],

  Kedah: [
    { name: 'Pantai Hospital Sungai Petani', address: 'Sungai Petani, Kedah', lat: 5.6470, lng: 100.4872, type: 'hospital', district: 'Sungai Petani' },
    { name: 'Hospital Sultan Abdul Halim', address: 'Bandar Amanjaya, Sungai Petani', lat: 5.6681, lng: 100.4879, type: 'hospital', district: 'Sungai Petani' },
    { name: 'Klinik Kesihatan Alor Setar', address: 'Alor Setar, Kedah', lat: 6.1248, lng: 100.3678, type: 'clinic', district: 'Alor Setar' },
  ],

  Kelantan: [
    { name: 'KPJ Perdana Specialist Hospital', address: 'Jalan Bayam, Kota Bharu', lat: 6.1432, lng: 102.2380, type: 'hospital', district: 'Kota Bharu' },
    { name: 'Hospital Universiti Sains Malaysia', address: 'Kubang Kerian, Kelantan', lat: 6.0896, lng: 102.2775, type: 'hospital', district: 'Kota Bharu' },
  ],

  Melaka: [
    { name: 'Pantai Hospital Melaka', address: 'Jalan Tun Sri Lanang, Melaka', lat: 2.1960, lng: 102.2487, type: 'hospital', district: 'Melaka Tengah' },
    { name: 'Oriental Melaka Straits Medical Centre', address: 'Klebang, Melaka', lat: 2.2205, lng: 102.2001, type: 'hospital', district: 'Melaka Tengah' },
  ],

  'Negeri Sembilan': [
    { name: 'KPJ Seremban Specialist Hospital', address: 'Jalan Toman 1, Seremban', lat: 2.7104, lng: 101.9381, type: 'hospital', district: 'Seremban' },
    { name: 'UCSI Hospital', address: 'Port Dickson, Negeri Sembilan', lat: 2.5331, lng: 101.8220, type: 'hospital', district: 'Port Dickson' },
  ],

  Pahang: [
    { name: 'KPJ Pahang Specialist Hospital', address: 'Bandar Indera Mahkota, Kuantan', lat: 3.8348, lng: 103.3212, type: 'hospital', district: 'Kuantan' },
    { name: 'Hospital Tengku Ampuan Afzan', address: 'Kuantan, Pahang', lat: 3.8135, lng: 103.3256, type: 'hospital', district: 'Kuantan' },
  ],

  Perlis: [
    { name: 'KPJ Perlis Specialist Hospital', address: 'Kangar, Perlis', lat: 6.4449, lng: 100.1986, type: 'hospital', district: 'Kangar' },
  ],

  Sabah: [
    { name: 'Gleneagles Hospital Kota Kinabalu', address: 'Riverson, Kota Kinabalu', lat: 5.9664, lng: 116.0601, type: 'hospital', district: 'Kota Kinabalu' },
    { name: 'Jesselton Medical Centre', address: 'Metro Town, Kota Kinabalu', lat: 5.9804, lng: 116.0911, type: 'hospital', district: 'Kota Kinabalu' },
  ],

  Sarawak: [
    { name: 'Normah Medical Specialist Centre', address: 'Kuching, Sarawak', lat: 1.5533, lng: 110.3447, type: 'hospital', district: 'Kuching' },
    { name: 'Borneo Medical Centre', address: 'Kuching, Sarawak', lat: 1.5314, lng: 110.3575, type: 'hospital', district: 'Kuching' },
  ],

  Terengganu: [
    { name: 'KPJ Kuala Terengganu Specialist Hospital', address: 'Kuala Terengganu', lat: 5.3299, lng: 103.1370, type: 'hospital', district: 'Kuala Terengganu' },
  ],

  Putrajaya: [
    { name: 'Hospital Putrajaya', address: 'Presint 7, Putrajaya', lat: 2.9264, lng: 101.6964, type: 'hospital', district: 'Putrajaya' },
  ],

  Labuan: [
    { name: 'Labuan Specialist Clinic', address: 'Jalan Kemajuan, Labuan', lat: 5.2803, lng: 115.2417, type: 'clinic', district: 'Victoria' },
  ],
};