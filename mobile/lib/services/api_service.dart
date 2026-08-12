import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/location_model.dart';

class ApiService {
  // Mobile emulator localhost IP or local network host
  static const String baseUrl = 'http://10.0.2.2:3000/api/locations';

  Future<List<LocationModel>> fetchLocations() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data is Map && data.containsKey('features')) {
          final List features = data['features'];
          return features.map((item) => LocationModel.fromJson(item)).toList();
        }
      }
      return _getFallbackLocations();
    } catch (e) {
      return _getFallbackLocations();
    }
  }

  Future<bool> addLocation(LocationModel location) async {
    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(location.toJson()),
      );
      return response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  List<LocationModel> _getFallbackLocations() {
    return [
      LocationModel(id: '1', name: 'Kadıköy İskelesi', category: 'station', latitude: 40.9904, longitude: 29.0253, description: 'Vapur iskelesi'),
      LocationModel(id: '2', name: 'Taksim Meydanı', category: 'station', latitude: 41.0369, longitude: 28.9850, description: 'Metro istasyonu'),
      LocationModel(id: '3', name: 'Beşiktaş Sahil', category: 'park', latitude: 41.0422, longitude: 29.0067, description: 'Sahil parkı'),
    ];
  }
}
