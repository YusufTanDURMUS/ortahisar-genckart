class LocationModel {
  final String id;
  final String name;
  final String? description;
  final String category;
  final double latitude;
  final double longitude;

  LocationModel({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    required this.latitude,
    required this.longitude,
  });

  factory LocationModel.fromJson(Map<String, dynamic> json) {
    // GeoJSON Feature parsing or flat JSON parsing
    if (json.containsKey('geometry')) {
      final coords = json['geometry']['coordinates'] as List;
      final props = json['properties'] as Map<String, dynamic>;
      return LocationModel(
        id: props['id'] ?? '',
        name: props['name'] ?? 'Bilinmeyen Konum',
        description: props['description'],
        category: props['category'] ?? 'custom',
        longitude: (coords[0] as num).toDouble(),
        latitude: (coords[1] as num).toDouble(),
      );
    }

    return LocationModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Bilinmeyen Konum',
      description: json['description'],
      category: json['category'] ?? 'custom',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'category': category,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
