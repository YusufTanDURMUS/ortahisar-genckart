import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const GisMobileApp());
}

class GisMobileApp extends StatelessWidget {
  const GisMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GIS Mobile Client',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
      ),
      home: const HomeScreen(),
    );
  }
}
