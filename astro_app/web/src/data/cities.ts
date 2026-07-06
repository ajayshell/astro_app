export interface City {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

// A small curated starter list, weighted toward South India. Users can also
// enter custom coordinates directly. Extend this list freely.
export const CITIES: City[] = [
  { name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
  { name: "Coimbatore", state: "Tamil Nadu", latitude: 11.0168, longitude: 76.9558 },
  { name: "Madurai", state: "Tamil Nadu", latitude: 9.9252, longitude: 78.1198 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", latitude: 10.7905, longitude: 78.7047 },
  { name: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { name: "Mysuru", state: "Karnataka", latitude: 12.2958, longitude: 76.6394 },
  { name: "Mangaluru", state: "Karnataka", latitude: 12.9141, longitude: 74.8560 },
  { name: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185 },
  { name: "Vijayawada", state: "Andhra Pradesh", latitude: 16.5062, longitude: 80.6480 },
  { name: "Tirupati", state: "Andhra Pradesh", latitude: 13.6288, longitude: 79.4192 },
  { name: "Kochi", state: "Kerala", latitude: 9.9312, longitude: 76.2673 },
  { name: "Thiruvananthapuram", state: "Kerala", latitude: 8.5241, longitude: 76.9366 },
  { name: "Kozhikode", state: "Kerala", latitude: 11.2588, longitude: 75.7804 },
  { name: "Mumbai", state: "Maharashtra", latitude: 19.0760, longitude: 72.8777 },
  { name: "Delhi", state: "Delhi", latitude: 28.7041, longitude: 77.1025 },
  { name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
  { name: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567 },
];
