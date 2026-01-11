export interface Player {
  id: number;
  name: string;
  position: string;
  x: number; // position horizontale 
  y: number; // position verticale 
  image?: string;
  teamId: number; // <-- ajoute ça
  rating?: number;
  vit?: number;
  tir?: number;
  pas?: number;
  dri?: number;
  def?: number;
  phy?: number;
  goals?: number;
  price?: number;
}
