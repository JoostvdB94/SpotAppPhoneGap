function Spot(id, name, description, latitude, longitude,image,owner,creationDate){
    this.id = id;
    this.name = name;
    this.description = description;
    this.longitude = longitude;
    this.latitude = latitude;
    this.image = image;
    this.owner = owner;
    this.creationDate = creationDate;
    this.distance = 0;
}