-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: katokkalinis_db
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  KEY `activity_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-08 05:59:26','2026-09-08 05:59:26'),(2,1,'employee.created','Added employee Toky Toky (paler@gmail.com).','App\\Models\\User',4,'2026-09-08 06:08:52','2026-09-08 06:08:52'),(3,1,'attendance.created','Recorded attendance for Toky Toky on 2026-09-08 00:00:00.','App\\Models\\Attendance',1,'2026-09-08 06:12:20','2026-09-08 06:12:20'),(4,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-09-08 06:16:06','2026-09-08 06:16:06'),(5,NULL,'schedule.completed','Completed schedule #2 for Barangay 1. Next scheduled for .','App\\Models\\CollectionSchedule',2,'2026-09-10 21:51:30','2026-09-10 21:51:30'),(6,NULL,'schedule.completed','Completed schedule #2 for Barangay 1. Next scheduled for 2026-09-19.','App\\Models\\CollectionSchedule',2,'2026-09-10 22:02:41','2026-09-10 22:02:41'),(7,7,'auth.login','Katok Resident (resident@katokkalinis.com) logged in.','App\\Models\\User',7,'2026-09-14 00:26:50','2026-09-14 00:26:50'),(8,7,'report.created','New report #3 (Test Sanitation Issue) submitted.','App\\Models\\Report',3,'2026-09-14 00:26:50','2026-09-14 00:26:50'),(9,7,'feedback.created','Resident Katok Resident submitted feedback.','App\\Models\\Feedback',1,'2026-09-14 00:26:50','2026-09-14 00:26:50'),(10,8,'auth.login','Katok Vendor (vendor@katokkalinis.com) logged in.','App\\Models\\User',8,'2026-09-14 00:26:51','2026-09-14 00:26:51'),(11,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 00:26:52','2026-09-14 00:26:52'),(12,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 00:27:29','2026-09-14 00:27:29'),(13,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-09-14 00:27:38','2026-09-14 00:27:38'),(14,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-09-14 00:27:47','2026-09-14 00:27:47'),(15,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-09-14 00:27:57','2026-09-14 00:27:57'),(16,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-09-14 00:50:54','2026-09-14 00:50:54'),(17,9,'schedule.created','Added Monday schedule for Barangay 1.','App\\Models\\CollectionSchedule',132,'2026-09-14 00:51:59','2026-09-14 00:51:59'),(18,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-09-14 00:56:57','2026-09-14 00:56:57'),(19,5,'auth.login','John Toky (mikay@katokkalinis.com) logged in.','App\\Models\\User',5,'2026-09-14 00:59:39','2026-09-14 00:59:39'),(20,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-09-14 01:01:52','2026-09-14 01:01:52'),(21,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 01:11:47','2026-09-14 01:11:47'),(22,1,'inspection.decision_updated','accepted inspection #1 for vendor #3.','App\\Models\\Inspection',1,'2026-09-14 01:13:12','2026-09-14 01:13:12'),(23,5,'auth.login','John Toky (mikay@katokkalinis.com) logged in.','App\\Models\\User',5,'2026-09-14 01:23:02','2026-09-14 01:23:02'),(24,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-09-14 01:24:50','2026-09-14 01:24:50'),(25,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-09-14 01:25:57','2026-09-14 01:25:57'),(26,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-09-14 01:26:38','2026-09-14 01:26:38'),(27,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-09-14 01:32:22','2026-09-14 01:32:22'),(28,3,'inspection.created','Recorded inspection for vendor #1 (score: 80).','App\\Models\\Inspection',2,'2026-09-14 01:32:53','2026-09-14 01:32:53'),(29,3,'inspection.created','Recorded inspection for vendor #1 (score: 100).','App\\Models\\Inspection',3,'2026-09-14 01:33:35','2026-09-14 01:33:35'),(30,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 01:57:43','2026-09-14 01:57:43'),(31,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 02:04:58','2026-09-14 02:04:58'),(32,1,'report.created','New report #4 (Mobile Upload Test Report) submitted.','App\\Models\\Report',4,'2026-09-14 02:04:58','2026-09-14 02:04:58'),(33,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 02:05:39','2026-09-14 02:05:39'),(34,1,'report.deleted','Deleted report Mobile Upload Test Report.',NULL,NULL,'2026-09-14 02:05:39','2026-09-14 02:05:39'),(35,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 02:48:52','2026-09-14 02:48:52'),(36,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-09-14 02:49:29','2026-09-14 02:49:29'),(37,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-10-03 03:55:00','2026-10-03 03:55:00'),(38,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-10-03 04:04:17','2026-10-03 04:04:17'),(39,2,'Submitted Collection Log','Driver John Driver recorded 5 tons at Barangay 1.',NULL,NULL,'2026-10-03 04:04:50','2026-10-03 04:04:50'),(40,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-03 04:07:20','2026-10-03 04:07:20'),(41,3,'inspection.created','Recorded inspection for vendor #3 (score: 90).','App\\Models\\Inspection',4,'2026-10-03 04:09:25','2026-10-03 04:09:25'),(42,3,'inspection.created','Recorded inspection for vendor #1 (score: 100).','App\\Models\\Inspection',5,'2026-10-03 04:10:05','2026-10-03 04:10:05'),(43,3,'inspection.created','Recorded inspection for vendor #2 (score: 20).','App\\Models\\Inspection',6,'2026-10-03 04:10:36','2026-10-03 04:10:36'),(44,5,'auth.login','John Toky (mikay@katokkalinis.com) logged in.','App\\Models\\User',5,'2026-10-03 04:14:18','2026-10-03 04:14:18'),(45,5,'report.created','New report #5 (baho) submitted.','App\\Models\\Report',5,'2026-10-03 04:16:46','2026-10-03 04:16:46'),(46,5,'report.created','New report #6 (baho baho) submitted.','App\\Models\\Report',6,'2026-10-03 07:31:46','2026-10-03 07:31:46'),(47,5,'feedback.created','Resident John Toky submitted feedback.','App\\Models\\Feedback',2,'2026-10-03 07:33:18','2026-10-03 07:33:18'),(48,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-10-03 07:34:16','2026-10-03 07:34:16'),(49,5,'auth.login','Toky Chung (mikay@katokkalinis.com) logged in.','App\\Models\\User',5,'2026-10-03 07:39:58','2026-10-03 07:39:58'),(50,5,'report.created','New report #7 (miming nga gamay dani) submitted.','App\\Models\\Report',7,'2026-10-03 07:42:09','2026-10-03 07:42:09'),(51,5,'feedback.created','Resident Toky Chungmanirat submitted feedback.','App\\Models\\Feedback',3,'2026-10-03 07:46:47','2026-10-03 07:46:47'),(52,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-10-03 07:49:00','2026-10-03 07:49:00'),(53,2,'Submitted Collection Log','Driver John Driver recorded 6.7 tons at Barangay 2.',NULL,NULL,'2026-10-03 07:50:03','2026-10-03 07:50:03'),(54,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-03 07:51:21','2026-10-03 07:51:21'),(55,3,'inspection.created','Recorded inspection for vendor #1 (score: 100).','App\\Models\\Inspection',7,'2026-10-03 07:52:31','2026-10-03 07:52:31'),(56,11,'collection_route.completed','Driver Juan completed Barangay 1 civic center route.',NULL,NULL,'2026-10-04 17:11:11','2026-10-04 17:46:11'),(57,15,'report.created','New resident report submitted by Jane Doe for Barangay 1.',NULL,NULL,'2026-10-04 15:46:11','2026-10-04 17:46:11'),(58,14,'inspection.created','Maria Inspector recorded inspection for KatokKalimpyo Fruit Stall (Score: 92%).',NULL,NULL,'2026-10-04 14:46:11','2026-10-04 17:46:11'),(59,20,'vendor.registered','New vendor Aling Nena Sari-Sari Store registered in Cogon Market.',NULL,NULL,'2026-10-04 11:46:11','2026-10-04 17:46:11'),(60,14,'inspection.decision_updated','Sanitary inspection approved for Carmen Fresh Vegetables Hub.',NULL,NULL,'2026-10-04 07:46:11','2026-10-04 17:46:11'),(61,12,'schedule.completed','Completed scheduled morning route for Barangay 2.',NULL,NULL,'2026-10-04 05:46:11','2026-10-04 17:46:11'),(62,19,'user.registered','New resident registered: Elena Cruz (Barangay 12).',NULL,NULL,'2026-10-03 17:46:11','2026-10-04 17:46:11'),(63,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-10-04 17:49:37','2026-10-04 17:49:37'),(64,1,'truck.status_updated','Set truck Truck #04 status to available.','App\\Models\\Truck',1,'2026-10-04 17:54:55','2026-10-04 17:54:55'),(65,8,'auth.login','Juan Dela Cruz (vendor@katokkalinis.com) logged in.','App\\Models\\User',8,'2026-10-04 18:04:30','2026-10-04 18:04:30'),(66,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-04 18:32:41','2026-10-04 18:32:41'),(67,3,'inspection.created','Recorded inspection for vendor #1 (score: 100).','App\\Models\\Inspection',13,'2026-10-04 18:33:19','2026-10-04 18:33:19'),(68,8,'auth.login','Juan Dela Cruz (vendor@katokkalinis.com) logged in.','App\\Models\\User',8,'2026-10-04 18:34:14','2026-10-04 18:34:14'),(69,1,'inspection.decision_updated','accepted inspection #13 for vendor #1.','App\\Models\\Inspection',13,'2026-10-04 18:35:28','2026-10-04 18:35:28'),(70,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-04 19:22:37','2026-10-04 19:22:37'),(71,3,'inspection.change_requested','Inspector submitted an evaluation change request for vendor #1 (pending score: 75).','App\\Models\\Inspection',13,'2026-10-04 19:22:37','2026-10-04 19:22:37'),(72,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-10-04 19:22:38','2026-10-04 19:22:38'),(73,9,'inspection.change_accepted','Approved evaluation change for inspection #13 (vendor #1, score: 75).','App\\Models\\Inspection',13,'2026-10-04 19:22:38','2026-10-04 19:22:38'),(74,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-04 19:22:54','2026-10-04 19:22:54'),(75,3,'inspection.change_requested','Inspector submitted an evaluation change request for vendor #1 (pending score: 95).','App\\Models\\Inspection',13,'2026-10-04 19:22:55','2026-10-04 19:22:55'),(76,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-10-04 19:22:55','2026-10-04 19:22:55'),(77,9,'inspection.change_rejected','Rejected evaluation change request for inspection #13.','App\\Models\\Inspection',13,'2026-10-04 19:22:55','2026-10-04 19:22:55'),(78,1,'inspection.decision_updated','accepted inspection #7 for vendor #1.','App\\Models\\Inspection',7,'2026-10-04 19:28:17','2026-10-04 19:28:17'),(79,1,'inspection.decision_updated','accepted inspection #5 for vendor #1.','App\\Models\\Inspection',5,'2026-10-04 19:28:55','2026-10-04 19:28:55'),(80,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-04 19:29:34','2026-10-04 19:29:34'),(81,3,'inspection.change_requested','Inspector submitted an evaluation change request for vendor #1 (pending score: 100).','App\\Models\\Inspection',13,'2026-10-04 19:30:17','2026-10-04 19:30:17'),(82,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-10-04 20:12:23','2026-10-04 20:12:23'),(83,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-10-04 20:12:56','2026-10-04 20:12:56'),(84,NULL,'inspection.change_requested','Inspector submitted an evaluation change request for vendor #1 (pending score: 90).','App\\Models\\Inspection',13,'2026-10-04 20:18:19','2026-10-04 20:18:19'),(85,NULL,'inspection.change_accepted','Approved evaluation change for inspection #13 (vendor #1, score: 90).','App\\Models\\Inspection',13,'2026-10-04 20:18:38','2026-10-04 20:18:38'),(86,NULL,'inspection.change_requested','Inspector submitted an evaluation change request for vendor #1 (pending score: 75).','App\\Models\\Inspection',13,'2026-10-04 20:22:46','2026-10-04 20:22:46'),(87,NULL,'inspection.change_accepted','Approved evaluation change for inspection #13 (vendor #1, score: 75).','App\\Models\\Inspection',13,'2026-10-04 20:22:46','2026-10-04 20:22:46'),(88,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-10-19 14:34:13','2026-10-19 14:34:13'),(89,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-10-19 14:47:12','2026-10-19 14:47:12'),(90,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-10-19 15:11:57','2026-10-19 15:11:57'),(91,5,'auth.login','Toky Chungmanirat (mikay@katokkalinis.com) logged in.','App\\Models\\User',5,'2026-10-19 15:13:17','2026-10-19 15:13:17'),(92,1,'schedule.created','Added Wednesday schedule for Barangay 12.','App\\Models\\CollectionSchedule',140,'2026-10-19 15:14:33','2026-10-19 15:14:33'),(93,1,'notification.broadcast','Broadcasted schedule push notification: \'hi\' to 0 devices.',NULL,NULL,'2026-10-19 15:27:52','2026-10-19 15:27:52'),(94,1,'schedule.created','Added Friday schedule for Barangay 12.','App\\Models\\CollectionSchedule',141,'2026-10-19 15:37:28','2026-10-19 15:37:28'),(95,1,'schedule.updated','Updated schedule #133.','App\\Models\\CollectionSchedule',133,'2026-10-19 15:37:53','2026-10-19 15:37:53'),(96,1,'schedule.updated','Updated schedule #138.','App\\Models\\CollectionSchedule',138,'2026-10-19 15:38:13','2026-10-19 15:38:13'),(97,1,'schedule.updated','Updated schedule #139.','App\\Models\\CollectionSchedule',139,'2026-10-19 15:38:34','2026-10-19 15:38:34'),(98,1,'schedule.updated','Updated schedule #139.','App\\Models\\CollectionSchedule',139,'2026-10-19 15:38:40','2026-10-19 15:38:40'),(99,1,'notification.broadcast','Broadcasted schedule push notification: \'wd\' to 0 devices.',NULL,NULL,'2026-10-19 15:40:35','2026-10-19 15:40:35'),(100,NULL,'notification.broadcast','Broadcasted advisory push notification: \'Compactor Arrival Advisory\' to 0 devices.',NULL,NULL,'2026-10-19 16:47:49','2026-10-19 16:47:49'),(101,NULL,'notification.broadcast','Broadcasted advisory push notification: \'Official Cleanliness Advisory\' to 0 devices.',NULL,NULL,'2026-10-19 16:53:54','2026-10-19 16:53:54'),(102,NULL,'notification.broadcast','Broadcasted schedule push notification: \'hi\' to 1 devices.',NULL,NULL,'2026-10-19 17:21:34','2026-10-19 17:21:34'),(103,NULL,'notification.broadcast','Broadcasted schedule push notification: \'hello po\' to 1 devices.',NULL,NULL,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(104,NULL,'notification.broadcast','Broadcasted schedule push notification: \'Collection Schedule for Barangay 1-5\' to 1 devices.',NULL,NULL,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(105,8,'auth.login','Juan Dela Cruz (vendor@katokkalinis.com) logged in.','App\\Models\\User',8,'2026-10-19 17:28:23','2026-10-19 17:28:23'),(106,NULL,'notification.broadcast','Broadcasted schedule push notification: \'hi\' to 1 devices.',NULL,NULL,'2026-10-19 17:28:41','2026-10-19 17:28:41'),(107,NULL,'inspector.qr_verified','Inspector John Inspector verified vendor KatokKalimpyo Fruit Stall (Divisoria Public Market, Stall #12) via QR verification.','App\\Models\\Vendor',1,'2026-10-19 20:16:20','2026-10-19 20:16:20'),(108,8,'auth.login','Juan Dela Cruz (vendor@katokkalinis.com) logged in.','App\\Models\\User',8,'2026-10-19 20:20:30','2026-10-19 20:20:30'),(109,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-19 20:21:33','2026-10-19 20:21:33'),(110,3,'inspector.qr_verified','Inspector John Inspector verified vendor KatokKalimpyo Fruit Stall (Divisoria Public Market, Stall #12) via QR verification.','App\\Models\\Vendor',1,'2026-10-19 20:21:38','2026-10-19 20:21:38'),(111,3,'inspector.qr_verified','Inspector John Inspector verified vendor KatokKalimpyo Fruit Stall (Divisoria Public Market, Stall #12) via QR verification.','App\\Models\\Vendor',1,'2026-10-19 20:21:39','2026-10-19 20:21:39'),(112,3,'inspector.qr_verified','Inspector John Inspector verified vendor KatokKalimpyo Fruit Stall (Divisoria Public Market, Stall #12) via QR verification.','App\\Models\\Vendor',1,'2026-10-19 20:22:06','2026-10-19 20:22:06'),(113,3,'inspector.qr_verified','Inspector John Inspector verified vendor KatokKalimpyo Fruit Stall (Divisoria Public Market, Stall #12) via QR verification.','App\\Models\\Vendor',1,'2026-10-19 20:22:08','2026-10-19 20:22:08'),(114,NULL,'inspection.change_requested','Inspector submitted an evaluation change request for vendor #1 (pending score: 100).','App\\Models\\Inspection',13,'2026-10-19 20:25:30','2026-10-19 20:25:30'),(115,NULL,'vendor.scores_updated (Initial database sync)','Vendor #1 (KatokKalimpyo Fruit Stall) evaluation recalculated: Sanitation [0.0 -> 7.5/10], Compliance [0% -> 75%], Grade [N/A -> B], Violations: 0. Action: Initial database sync','App\\Models\\Vendor',1,'2026-10-19 20:48:35','2026-10-19 20:48:35'),(116,NULL,'vendor.scores_updated (Initial database sync)','Vendor #2 (Aling Nena Sari-Sari Store) evaluation recalculated: Sanitation [0.0 -> 8.2/10], Compliance [0% -> 82%], Grade [N/A -> B], Violations: 0. Action: Initial database sync','App\\Models\\Vendor',2,'2026-10-19 20:48:35','2026-10-19 20:48:35'),(117,NULL,'vendor.scores_updated (Initial database sync)','Vendor #3 (Mang Tomas Fresh Meat Section) evaluation recalculated: Sanitation [0.0 -> 6.7/10], Compliance [0% -> 67%], Grade [N/A -> C], Violations: 0. Action: Initial database sync','App\\Models\\Vendor',3,'2026-10-19 20:48:35','2026-10-19 20:48:35'),(118,NULL,'vendor.scores_updated (Initial database sync)','Vendor #4 (Cogon Dry Goods & Apparel) evaluation recalculated: Sanitation [0.0 -> 4.7/10], Compliance [0% -> 47%], Grade [N/A -> C], Violations: 0. Action: Initial database sync','App\\Models\\Vendor',4,'2026-10-19 20:48:35','2026-10-19 20:48:35'),(119,NULL,'vendor.scores_updated (Initial database sync)','Vendor #5 (Carmen Fresh Vegetables Hub) evaluation recalculated: Sanitation [0.0 -> 8.6/10], Compliance [0% -> 86%], Grade [N/A -> A], Violations: 0. Action: Initial database sync','App\\Models\\Vendor',5,'2026-10-19 20:48:35','2026-10-19 20:48:35'),(120,4,'vendor.scores_updated (Verification test)','Vendor #1 (KatokKalimpyo Fruit Stall) evaluation recalculated: Sanitation [7.5 -> 7.5/10], Compliance [75% -> 75%], Grade [B -> B], Violations: 0. Action: Verification test','App\\Models\\Vendor',1,'2026-10-19 21:21:30','2026-10-19 21:21:30'),(121,3,'auth.login','John Inspector (inspector@katokkalinis.com) logged in.','App\\Models\\User',3,'2026-10-19 21:40:47','2026-10-19 21:40:47'),(122,NULL,'inspection.change_requested','Inspector submitted an evaluation change request for vendor #1 (pending score: 80).','App\\Models\\Inspection',13,'2026-10-19 21:41:04','2026-10-19 21:41:04'),(123,2,'auth.login','John Driver (driver@katokkalinis.com) logged in.','App\\Models\\User',2,'2026-10-19 21:43:35','2026-10-19 21:43:35'),(124,NULL,'truck.driver_status_update','Driver updated truck Truck #04 (ABC-1234) status to on_route.','App\\Models\\Truck',1,'2026-10-19 22:16:57','2026-10-19 22:16:57'),(125,NULL,'truck.driver_status_update','Driver updated truck Truck #04 (ABC-1234) status to available.','App\\Models\\Truck',1,'2026-10-19 22:17:04','2026-10-19 22:17:04'),(126,2,'truck.driver_status_update','Driver updated truck TRK-04 (KAL-104) status to available.','App\\Models\\Truck',5,'2026-10-19 22:28:25','2026-10-19 22:28:25'),(127,2,'truck.driver_status_update','Driver updated truck TRK-04 (KAL-104) status to on_route.','App\\Models\\Truck',5,'2026-10-19 22:28:38','2026-10-19 22:28:38'),(128,2,'truck.driver_status_update','Driver updated truck TRK-04 (KAL-104) status to available.','App\\Models\\Truck',5,'2026-10-19 22:28:42','2026-10-19 22:28:42'),(129,2,'Submitted Collection Log','Driver John Driver recorded 6.75 tons at Barangay 4.',NULL,NULL,'2026-10-19 22:29:32','2026-10-19 22:29:32'),(130,2,'truck.driver_status_update','Driver updated truck TRK-04 (KAL-104) status to on_route.','App\\Models\\Truck',5,'2026-10-19 22:30:03','2026-10-19 22:30:03'),(131,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-10-20 06:21:21','2026-10-20 06:21:21'),(132,9,'auth.login','System Administrator (admin@katokkalinis.com) logged in.','App\\Models\\User',9,'2026-10-20 06:21:29','2026-10-20 06:21:29'),(133,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-10-20 06:26:01','2026-10-20 06:26:01'),(134,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-10-20 06:31:26','2026-10-20 06:31:26'),(135,2,'truck.driver_status_update','Driver updated truck TRK-04 (KAL-104) status to available.','App\\Models\\Truck',5,'2026-10-20 06:34:29','2026-10-20 06:34:29'),(136,1,'auth.login','Super Administrator (superadmin@katokkalinis.com) logged in.','App\\Models\\User',1,'2026-10-20 06:36:17','2026-10-20 06:36:17');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('present','late','absent','on_leave') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  `archived_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendances_user_id_date_unique` (`user_id`,`date`),
  CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
INSERT INTO `attendances` VALUES (1,4,'2026-09-08','07:00:00','17:00:00','present',NULL,0,NULL,'2026-09-08 06:12:20','2026-09-08 06:12:20'),(2,1,'2026-10-05','01:49:37',NULL,'present','Automated check-in on login',0,NULL,'2026-10-04 17:49:37','2026-10-04 17:49:37'),(3,8,'2026-10-05','02:04:30','02:34:14','present','Automated check-in on login',0,NULL,'2026-10-04 18:04:30','2026-10-04 18:34:14'),(4,3,'2026-10-05','02:32:41','03:29:34','present','Automated check-in on login',0,NULL,'2026-10-04 18:32:41','2026-10-04 19:29:34'),(5,9,'2026-10-05','03:22:38','04:12:56','present','Automated check-in on login',0,NULL,'2026-10-04 19:22:38','2026-10-04 20:12:56'),(6,2,'2026-10-19','22:34:13','22:47:12','present','Automated check-in on login',0,NULL,'2026-10-19 14:34:13','2026-10-19 14:47:12'),(7,1,'2026-10-19','23:11:57',NULL,'present','Automated check-in on login',0,NULL,'2026-10-19 15:11:57','2026-10-19 15:11:57'),(8,5,'2026-10-19','23:13:17',NULL,'present','Automated check-in on login',0,NULL,'2026-10-19 15:13:17','2026-10-19 15:13:17'),(9,8,'2026-10-20','01:28:23','04:20:30','present','Automated check-in on login',0,NULL,'2026-10-19 17:28:23','2026-10-19 20:20:30'),(10,3,'2026-10-20','04:21:33','05:40:47','present','Automated check-in on login',0,NULL,'2026-10-19 20:21:33','2026-10-19 21:40:47'),(11,2,'2026-10-20','05:43:35',NULL,'present','Automated check-in on login',0,NULL,'2026-10-19 21:43:35','2026-10-19 21:43:35'),(12,1,'2026-10-20','14:21:21','14:36:17','present','Automated check-in on login',0,NULL,'2026-10-20 06:21:21','2026-10-20 06:36:17'),(13,9,'2026-10-20','14:21:29',NULL,'present','Automated check-in on login',0,NULL,'2026-10-20 06:21:29','2026-10-20 06:21:29');
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barangays`
--

DROP TABLE IF EXISTS `barangays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barangays` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cagayan de Oro City',
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barangays_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barangays`
--

LOCK TABLES `barangays` WRITE;
/*!40000 ALTER TABLE `barangays` DISABLE KEYS */;
INSERT INTO `barangays` VALUES (1,'Barangay 1','BRGY-001','Cagayan de Oro City',8.4745000,124.6432000,'City Hall & Riverwall Walkway Corridor (Poblacion North)',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(2,'Barangay 2','BRGY-002','Cagayan de Oro City',8.4758000,124.6441000,'Capistrano & Gaerlan St. Corridor (Poblacion North)',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(3,'Barangay 3','BRGY-003','Cagayan de Oro City',8.4770000,124.6445000,'Velez & Burgos St. Commercial Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(4,'Barangay 4','BRGY-004','Cagayan de Oro City',8.4741000,124.6453000,'San Agustin Cathedral & Plaza Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(5,'Barangay 5','BRGY-005','Cagayan de Oro City',8.4735000,124.6461000,'Rizal Monument & Fernandez St. Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(6,'Barangay 6','BRGY-006','Cagayan de Oro City',8.4728000,124.6470000,'Tiano Brothers & Pabayo Commercial Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(7,'Barangay 7','BRGY-007','Cagayan de Oro City',8.4722000,124.6478000,'Plaza Divisoria & Tirso Neri St. Kiosks',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(8,'Barangay 8','BRGY-008','Cagayan de Oro City',8.4715000,124.6486000,'RN Abejuela & Central Divisoria Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(9,'Barangay 9','BRGY-009','Cagayan de Oro City',8.4708000,124.6494000,'Dolores & Toribio Chaves Residential Area',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(10,'Barangay 10','BRGY-010','Cagayan de Oro City',8.4700000,124.6502000,'Macahambus & Capistrano Perimeter',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(11,'Barangay 11','BRGY-011','Cagayan de Oro City',8.4792000,124.6512000,'Hayes & Velez South Commercial Belt',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(12,'Barangay 12','BRGY-012','Cagayan de Oro City',8.4800000,124.6520000,'Apolinar Velez St. Medical & Business Belt',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(13,'Barangay 13','BRGY-013','Cagayan de Oro City',8.4808000,124.6528000,'Pabayo & Pacana Commercial Boundary',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(14,'Barangay 14','BRGY-014','Cagayan de Oro City',8.4816000,124.6536000,'Toribio Chaves & Corrales Ave Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(15,'Barangay 15','BRGY-015','Cagayan de Oro City',8.4824000,124.6544000,'Fernandez & Tiano South Commercial Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(16,'Barangay 16','BRGY-016','Cagayan de Oro City',8.4832000,124.6552000,'Mortola & San Agustin Extended Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(17,'Barangay 17','BRGY-017','Cagayan de Oro City',8.4840000,124.6560000,'A. Velez St. South Business Boundary',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(18,'Barangay 18','BRGY-018','Cagayan de Oro City',8.4848000,124.6568000,'Macahambus & Pabayo South Zone',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(19,'Barangay 19','BRGY-019','Cagayan de Oro City',8.4856000,124.6576000,'Chavez & Corrales Ave Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(20,'Barangay 20','BRGY-020','Cagayan de Oro City',8.4864000,124.6584000,'JR Borja South Institutional Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(21,'Barangay 21','BRGY-021','Cagayan de Oro City',8.4872000,124.6592000,'Corrales Extension & Provincial Capitol',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(22,'Barangay 22','BRGY-022','Cagayan de Oro City',8.4880000,124.6600000,'Bitan-ag Creek & Gaabucayan Drainage Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(23,'Barangay 23','BRGY-023','Cagayan de Oro City',8.4888000,124.6608000,'Osmeña Extension & Old Railhead Belt',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(24,'Barangay 24','BRGY-024','Cagayan de Oro City',8.4896000,124.6616000,'Limketkai Drive West Commercial Approach',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(25,'Barangay 25','BRGY-025','Cagayan de Oro City',8.4904000,124.6624000,'Limketkai Drive Commercial Culvert Area',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(26,'Barangay 26','BRGY-026','Cagayan de Oro City',8.4912000,124.6632000,'Valenzuela & Kolambog Transition Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(27,'Barangay 27','BRGY-027','Cagayan de Oro City',8.4920000,124.6640000,'Ramonal Village East Approach',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(28,'Barangay 28','BRGY-028','Cagayan de Oro City',8.4928000,124.6648000,'Camaman-an Border Drainage Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(29,'Barangay 29','BRGY-029','Cagayan de Oro City',8.4936000,124.6656000,'Pinikitan & Bitan-ag Upper Creek Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(30,'Barangay 30','BRGY-030','Cagayan de Oro City',8.4944000,124.6664000,'Lapasan Creek & East Commercial Boundary',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(31,'Barangay 31','BRGY-031','Cagayan de Oro City',8.4952000,124.6672000,'JR Borja West Commercial District',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(32,'Barangay 32','BRGY-032','Cagayan de Oro City',8.4960000,124.6680000,'Yacapin West & Trading Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(33,'Barangay 33','BRGY-033','Cagayan de Oro City',8.4781500,124.6476500,'Cogon West & Capt. Vicente Roa Commercial Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(34,'Barangay 34','BRGY-034','Cagayan de Oro City',8.4976000,124.6696000,'Agora South & Osmeña Commercial Terminal Area',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(35,'Barangay 35','BRGY-035','Cagayan de Oro City',8.4984000,124.6704000,'C.M. Recto Ave & Highway Transit Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(36,'Barangay 36','BRGY-036','Cagayan de Oro City',8.4992000,124.6712000,'Gaabucayan Marine & Port Access Area',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(37,'Barangay 37','BRGY-037','Cagayan de Oro City',8.5000000,124.6720000,'Corrales North & Port Terminal Corridor',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(38,'Barangay 38','BRGY-038','Cagayan de Oro City',8.5008000,124.6728000,'Macabalan South & Coastal Approach',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(39,'Barangay 39','BRGY-039','Cagayan de Oro City',8.4768900,124.6489500,'Cogon East Fish, Poultry & Night Market Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(40,'Barangay 40','BRGY-040','Cagayan de Oro City',8.4772000,124.6493000,'Cogon North Wholesale Vegetable & Fruit Strip',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(41,'Barangay 123, Divi',NULL,'Cagayan de Oro City',NULL,NULL,NULL,1,'2026-09-11 00:55:19','2026-09-11 00:55:19'),(42,'Barangay 124, Cogon',NULL,'Cagayan de Oro City',NULL,NULL,NULL,1,'2026-09-11 00:55:19','2026-09-11 00:55:19'),(43,'Barangay 125, Poblacion',NULL,'Cagayan de Oro City',NULL,NULL,NULL,1,'2026-09-11 00:55:19','2026-09-11 00:55:19'),(44,'Cogon Market Zone','MKT-COGON','Cagayan de Oro City',8.4776100,124.6482100,'Cogon Public Market Wholesale & Commercial Corridor (Capt. Vicente Roa / Osmeña / Yacapin)',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(45,'Carmen Market Zone','MKT-CARMEN','Cagayan de Oro City',8.4831000,124.6364000,'Carmen Public Market & Terminal Complex (Vamenta Blvd / Seriña St Corridor)',1,'2026-10-04 17:46:06','2026-10-04 17:46:06'),(46,'Barangay 1','CDO-BRGY-01','Cagayan de Oro City',8.4822000,124.6472000,'Poblacion - City Health & Rizal Park Sector • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(47,'Barangay 2','CDO-BRGY-02','Cagayan de Oro City',8.4835000,124.6480000,'Poblacion - Main Commercial Avenue & Burgos • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(48,'Barangay 3','CDO-BRGY-03','Cagayan de Oro City',8.4842000,124.6495000,'Poblacion - Fernandez & Hayes Junction • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(49,'Barangay 4','CDO-BRGY-04','Cagayan de Oro City',8.4815000,124.6455000,'Poblacion - Public Market & Port Access • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(50,'Barangay 5','CDO-BRGY-05','Cagayan de Oro City',8.4800000,124.6440000,'Poblacion - Macabalan Gateway • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(51,'Barangay 6','CDO-BRGY-06','Cagayan de Oro City',8.4785000,124.6460000,'Poblacion - Toribio Chaves St Residential • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(52,'Barangay 7','CDO-BRGY-07','Cagayan de Oro City',8.4795000,124.6490000,'Poblacion - Corrales Ave North • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(53,'Barangay 8','CDO-BRGY-08','Cagayan de Oro City',8.4850000,124.6470000,'Poblacion - Capistrano North Sector • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(54,'Barangay 9','CDO-BRGY-09','Cagayan de Oro City',8.4865000,124.6485000,'Poblacion - Velez Commercial Corridor • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(55,'Barangay 10','CDO-BRGY-10','Cagayan de Oro City',8.4875000,124.6500000,'Poblacion - Gaabucayan Industrial Fringe • Route #1 (Truck KAL-101)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(56,'Barangay 11','CDO-BRGY-11','Cagayan de Oro City',8.4770000,124.6450000,'Central - Tirso Neri Heritage Zone • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(57,'Barangay 12','CDO-BRGY-12','Cagayan de Oro City',8.4760000,124.6470000,'Central - Pacana St Mixed Zone • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(58,'Barangay 13','CDO-BRGY-13','Cagayan de Oro City',8.4755000,124.6495000,'Central - Dolores Compound • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(59,'Barangay 14','CDO-BRGY-14','Cagayan de Oro City',8.4740000,124.6465000,'Central - Yacapin St Residential • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(60,'Barangay 15','CDO-BRGY-15','Cagayan de Oro City',8.4730000,124.6480000,'Central - JR Borja West Corridor • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(61,'Barangay 16','CDO-BRGY-16','Cagayan de Oro City',8.4725000,124.6510000,'Central - Osmeña Extension North • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(62,'Barangay 17','CDO-BRGY-17','Cagayan de Oro City',8.4745000,124.6525000,'Central - Cogon Public Market Periphery • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(63,'Barangay 18','CDO-BRGY-18','Cagayan de Oro City',8.4760000,124.6540000,'Central - Capt. Vicente Roa Sector • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(64,'Barangay 19','CDO-BRGY-19','Cagayan de Oro City',8.4775000,124.6520000,'Central - Corrales Commercial East • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(65,'Barangay 20','CDO-BRGY-20','Cagayan de Oro City',8.4790000,124.6535000,'Central - Limketkai Access Corridor • Route #2 (Truck KAL-102)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(66,'Barangay 21','CDO-BRGY-21','Cagayan de Oro City',8.4810000,124.6550000,'East - Lapasan Boundary North • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(67,'Barangay 22','CDO-BRGY-22','Cagayan de Oro City',8.4825000,124.6565000,'East - Julio Pacana Warehouse Sector • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(68,'Barangay 23','CDO-BRGY-23','Cagayan de Oro City',8.4840000,124.6550000,'East - Agora Terminal Linkage • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(69,'Barangay 24','CDO-BRGY-24','Cagayan de Oro City',8.4855000,124.6530000,'East - Gaisano City Perimeter • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(70,'Barangay 25','CDO-BRGY-25','Cagayan de Oro City',8.4830000,124.6515000,'East - Provincial Capitol Perimeter • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(71,'Barangay 26','CDO-BRGY-26','Cagayan de Oro City',8.4815000,124.6500000,'East - Apolinar Velez Central • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(72,'Barangay 27','CDO-BRGY-27','Cagayan de Oro City',8.4800000,124.6510000,'East - Tiano Brothers St North • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(73,'Barangay 28','CDO-BRGY-28','Cagayan de Oro City',8.4780000,124.6505000,'East - Pabayo St Residential • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(74,'Barangay 29','CDO-BRGY-29','Cagayan de Oro City',8.4765000,124.6515000,'East - Mortola St Junction • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(75,'Barangay 30','CDO-BRGY-30','Cagayan de Oro City',8.4750000,124.6530000,'East - Daumar St Commercial Hub • Route #3 (Truck KAL-103)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(76,'Barangay 31','CDO-BRGY-31','Cagayan de Oro City',8.4735000,124.6545000,'South - Cogon Market Central Bay • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(77,'Barangay 32','CDO-BRGY-32','Cagayan de Oro City',8.4720000,124.6535000,'South - San Agustin Cathedral Periphery • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(78,'Barangay 33','CDO-BRGY-33','Cagayan de Oro City',8.4710000,124.6520000,'South - Burgos St Riverfront Access • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(79,'Barangay 34','CDO-BRGY-34','Cagayan de Oro City',8.4705000,124.6500000,'South - City Hall & Gaston Park Zone • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(80,'Barangay 35','CDO-BRGY-35','Cagayan de Oro City',8.4695000,124.6485000,'South - Carmen Bridge Approach East • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(81,'Barangay 36','CDO-BRGY-36','Cagayan de Oro City',8.4715000,124.6470000,'South - Victoria St Riverside • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(82,'Barangay 37','CDO-BRGY-37','Cagayan de Oro City',8.4730000,124.6455000,'South - CDO Riverbank West Sector • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(83,'Barangay 38','CDO-BRGY-38','Cagayan de Oro City',8.4745000,124.6440000,'South - Consolacion Perimeter Road • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(84,'Barangay 39','CDO-BRGY-39','Cagayan de Oro City',8.4760000,124.6425000,'South - Puntod Port Access Route • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(85,'Barangay 40','CDO-BRGY-40','Cagayan de Oro City',8.4780000,124.6410000,'South - Macabalan Coastal Boundary • Route #4 (Truck KAL-104)',1,'2026-10-04 17:46:08','2026-10-04 17:46:08');
/*!40000 ALTER TABLE `barangays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clenro_pileup_reports`
--

DROP TABLE IF EXISTS `clenro_pileup_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clenro_pileup_reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `incident_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_zone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barangay_number` tinyint unsigned DEFAULT NULL,
  `specific_landmark` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `incident_date` datetime NOT NULL,
  `cleared_date` datetime DEFAULT NULL,
  `turnaround_hours` decimal(6,2) DEFAULT NULL,
  `sla_status` enum('within_sla','breached_24h','breached_48h','critical_unresolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'within_sla',
  `waste_volume_m3` decimal(8,2) NOT NULL,
  `estimated_tonnage` decimal(8,2) NOT NULL,
  `severity` enum('low','moderate','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'moderate',
  `waste_category` enum('market_organic_vegetable','commercial_retail_packaging','household_unsegregated','single_use_plastics','wet_fish_meat_waste','drainage_canal_debris') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'household_unsegregated',
  `root_cause` enum('market_closing_overflow','delayed_contractor_dispatch','unauthorized_vendor_dumping','monsoon_drainage_blockage','street_sweeping_backlog','collection_truck_breakdown') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'delayed_contractor_dispatch',
  `contractor_assigned` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IPM CDO Urban Haulers',
  `truck_plate` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('resolved','in_progress','pending','chronic_hotspot') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'resolved',
  `clenro_action_taken` text COLLATE utf8mb4_unicode_ci,
  `decision_recommendation` text COLLATE utf8mb4_unicode_ci,
  `reported_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CLENRO Field Inspector',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clenro_pileup_reports_incident_code_unique` (`incident_code`),
  KEY `clenro_pileup_reports_location_zone_index` (`location_zone`),
  KEY `clenro_pileup_reports_barangay_number_index` (`barangay_number`),
  KEY `clenro_pileup_reports_incident_date_index` (`incident_date`),
  KEY `clenro_pileup_reports_severity_index` (`severity`),
  KEY `clenro_pileup_reports_status_index` (`status`),
  KEY `clenro_pileup_reports_root_cause_index` (`root_cause`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clenro_pileup_reports`
--

LOCK TABLES `clenro_pileup_reports` WRITE;
/*!40000 ALTER TABLE `clenro_pileup_reports` DISABLE KEYS */;
INSERT INTO `clenro_pileup_reports` VALUES (1,'CDO-CGN-2024-0112','Cogon Market Zone',34,'Yacapin St. Entrance (Vegetable & Fruit Section)',8.4776100,124.6482100,'2024-01-12 21:30:00','2024-01-13 04:15:00',6.75,'within_sla',18.50,7.40,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Dispatched 2 compactors for immediate post-closing sweep. Cleaned curb and disinfected trading lane.','Mandate vegetable stallholders to bag trimmings prior to 8:30 PM closing. Establish dedicated 9:00 PM compactor run.','CLENRO Market Inspector #04','2026-10-04 17:46:08','2026-10-04 17:46:08'),(2,'CDO-CGN-2024-0428','Cogon Market Zone',33,'J.R. Borja St. Frontage (Near Capt. Vicente Roa Intersection)',8.4781500,124.6476500,'2024-04-28 22:10:00','2024-04-29 11:30:00',13.33,'breached_24h',14.20,5.60,'high','commercial_retail_packaging','collection_truck_breakdown','IPM CDO Urban Haulers','KDG-8821','resolved','Contractor primary compactor experienced hydraulic failure; CLENRO ordered backup dump truck dispatch at 9:00 AM.','Contractor required to maintain stand-by replacement vehicle within 1 hour radius of Cogon Commercial District.','Barangay 33 Sanitation Officer','2026-10-04 17:46:08','2026-10-04 17:46:08'),(3,'CDO-CGN-2024-0827','Cogon Market Zone',39,'Capt. Vicente Roa St. Night Market Vendor Strip',8.4768900,124.6489500,'2024-08-27 23:45:00','2024-08-28 05:00:00',5.25,'within_sla',24.00,9.80,'critical','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9014','resolved','Higalaay Festival peak shopping crowd. Deployed two emergency open haulers plus 12 city eco-sweepers.','Allocate 30% additional hauling capacity during annual Higalaay Festival week (Aug 24-29). Install 10 high-capacity mobile bins.','CLENRO Festival Monitoring Taskforce','2026-10-04 17:46:08','2026-10-04 17:46:08'),(4,'CDO-CGN-2024-1223','Cogon Market Zone',34,'Osmeña St. Commercial Alley & Fruit Stalls',8.4772000,124.6493000,'2024-12-23 20:00:00','2024-12-24 07:30:00',11.50,'within_sla',28.50,11.40,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Holiday fruit deliveries created 3-meter high mound on pedestrian lane. Cleared via back-to-back truck trips.','Implement mandatory pre-sorted organic waste drop-off zones during December 15-31 holiday peak.','Cogon Market Administration','2026-10-04 17:46:08','2026-10-04 17:46:08'),(5,'CDO-CGN-2025-0314','Cogon Market Zone',40,'Guillermo St. Loading Bay & Fish Section',8.4764000,124.6479000,'2025-03-14 18:30:00','2025-03-15 09:00:00',14.50,'breached_24h',12.00,5.20,'high','wet_fish_meat_waste','delayed_contractor_dispatch','IPM CDO Urban Haulers','KDG-8821','resolved','Putrid fish entrails left overnight. Contractor penalized under Section 14 of City Sanitation Agreement.','Impose ₱15,000 contractor liquidated damages for putrescible fish waste SLA breach over 12 hours.','CLENRO Eco-Warden #11','2026-10-04 17:46:08','2026-10-04 17:46:08'),(6,'CDO-CGN-2025-0718','Cogon Market Zone',33,'J.R. Borja St. Corner Yacapin St.',8.4780500,124.6481000,'2025-07-18 19:15:00','2025-07-19 18:30:00',23.25,'breached_24h',16.80,6.90,'critical','market_organic_vegetable','monsoon_drainage_blockage','IPM CDO Urban Haulers','ABC-4102','chronic_hotspot','Flash rain caused uncollected market garbage to float into drainage inlets. Heavy clearing performed.','Elevate waste staging platform above curb level to prevent washout during monsoon downpours.','CLENRO Drainage Oversight Team','2026-10-04 17:46:08','2026-10-04 17:46:08'),(7,'CDO-CGN-2025-1011','Cogon Market Zone',34,'Yacapin St. Commercial Alley (Mid-Block)',8.4778000,124.6484500,'2025-10-11 21:00:00','2025-10-12 03:30:00',6.50,'within_sla',15.00,6.00,'high','commercial_retail_packaging','unauthorized_vendor_dumping','City In-House Market Sweep Team','LGU-9014','resolved','Issued 4 citation tickets under CDO City Ordinance No. 13378-2018 to non-compliant transient vendors.','Deploy 2 night-patrol Eco-Wardens between 7:00 PM and 10:00 PM to apprehend illegal dumpers.','CLENRO Eco-Warden #07','2026-10-04 17:46:08','2026-10-04 17:46:08'),(8,'CDO-CGN-2026-0215','Cogon Market Zone',39,'Capt. Vicente Roa St. Dry Goods Perimeter',8.4769200,124.6488000,'2026-02-15 20:30:00','2026-02-16 02:45:00',6.25,'within_sla',11.20,4.50,'moderate','commercial_retail_packaging','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Night route collection completed smoothly on scheduled time.','Maintain current 8:30 PM collection dispatch protocol for dry goods strip.','CLENRO Night Inspector #02','2026-10-04 17:46:08','2026-10-04 17:46:08'),(9,'CDO-CRM-2024-0219','Carmen Market Zone',NULL,'Carmen Public Market - Vamenta Blvd Frontage',8.4831000,124.6364000,'2024-02-19 19:40:00','2024-02-20 03:00:00',7.33,'within_sla',14.50,5.80,'high','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4105','resolved','Compactor cleared 14.5 m3 of organic trimmings from Vamenta street vendors before morning traffic.','Establish permanent segregated bio-waste holding pens inside market perimeter.','Carmen Market Supervisor','2026-10-04 17:46:08','2026-10-04 17:46:08'),(10,'CDO-CRM-2024-0610','Carmen Market Zone',NULL,'Seriña St. Wet Section & Fish/Poultry Alley',8.4828000,124.6358000,'2024-06-10 18:00:00','2024-06-11 10:15:00',16.25,'breached_24h',11.00,4.80,'critical','wet_fish_meat_waste','delayed_contractor_dispatch','IPM CDO Urban Haulers','KDG-8821','resolved','Severe odor complaints from residents. Hauler failed afternoon pickup. Warning notice issued.','Enforce penalty clause for untreated wet poultry/fish waste standing over 8 hours.','CLENRO Health & Sanitation Inspector','2026-10-04 17:46:08','2026-10-04 17:46:08'),(11,'CDO-CRM-2024-0828','Carmen Market Zone',NULL,'Carmen Bridge Foot (Ysalina Bridge Approach Corridor)',8.4839000,124.6391000,'2024-08-28 21:15:00','2024-08-29 04:00:00',6.75,'within_sla',19.80,7.90,'critical','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9015','resolved','Higalaay Festival riverbank parade spectator garbage combined with market overflow. Quick night mobilization.','Deploy specialized street-sweeping support vehicle along bridge approach during festival days.','CLENRO Festival Taskforce','2026-10-04 17:46:08','2026-10-04 17:46:08'),(12,'CDO-CRM-2024-1115','Carmen Market Zone',NULL,'Macanhan Commercial Border / Market Rear Exit',8.4819000,124.6349000,'2024-11-15 19:30:00','2024-11-17 08:00:00',36.50,'breached_48h',16.50,6.60,'critical','market_organic_vegetable','unauthorized_vendor_dumping','IPM CDO Urban Haulers','ABC-4105','chronic_hotspot','Unauthorized vegetable dumping in rear alley ignored by hauler for 36 hours. Deducted ₱25,000 from monthly billing.','Install solar-powered CCTV camera at rear exit alley; schedule dual daily sweeps (6:00 AM and 6:00 PM).','CLENRO Enforcement Division','2026-10-04 17:46:08','2026-10-04 17:46:08'),(13,'CDO-CRM-2025-0106','Carmen Market Zone',NULL,'Carmen Public Market - Vamenta Blvd Frontage',8.4831200,124.6364500,'2025-01-06 20:00:00','2025-01-07 03:15:00',7.25,'within_sla',13.00,5.20,'high','commercial_retail_packaging','market_closing_overflow','IPM CDO Urban Haulers','ABC-4105','resolved','Post-Three Kings retail packaging pile cleared overnight without delay.','Standard night collection routine effective; maintain route priority.','Carmen Market Supervisor','2026-10-04 17:46:08','2026-10-04 17:46:08'),(14,'CDO-CRM-2025-0520','Carmen Market Zone',NULL,'Seriña St. Mid-Market Junction',8.4827000,124.6360000,'2025-05-20 18:45:00','2025-05-21 07:00:00',12.25,'breached_24h',9.50,3.80,'moderate','market_organic_vegetable','street_sweeping_backlog','City In-House Market Sweep Team','LGU-9015','resolved','Afternoon sweep team was understaffed; morning replacement team cleared pile.','Rebalance market sweeper shifts so that 60% of personnel are assigned to 3 PM - 11 PM window.','CLENRO Sanitation Division','2026-10-04 17:46:08','2026-10-04 17:46:08'),(15,'CDO-CRM-2025-0912','Carmen Market Zone',NULL,'Carmen Bridge Approach (West Bank Riverside)',8.4837500,124.6385000,'2025-09-12 17:30:00','2025-09-13 14:00:00',20.50,'breached_24h',15.20,6.10,'critical','drainage_canal_debris','monsoon_drainage_blockage','IPM CDO Urban Haulers','ABC-4105','chronic_hotspot','Heavy rainfall caused riverbank culvert backflow, depositing market plastic waste. Cleared with backhoe support.','Install trash boom along Carmen market creek outlet before October habagat storms.','CLENRO River Watch Unit','2026-10-04 17:46:08','2026-10-04 17:46:08'),(16,'CDO-CRM-2026-0128','Carmen Market Zone',NULL,'Carmen Public Market - Vamenta Blvd Frontage',8.4831000,124.6364000,'2026-01-28 20:10:00','2026-01-29 02:30:00',6.33,'within_sla',12.80,5.10,'high','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4105','resolved','Regular nightly pickup executed on time.','Maintain current schedule.','Carmen Market Supervisor','2026-10-04 17:46:08','2026-10-04 17:46:08'),(17,'CDO-B01-2024-0305','Barangay 1',1,'Burgos St. Riverwall & City Hall Perimeter',8.4745000,124.6432000,'2024-03-05 08:30:00','2024-03-05 14:00:00',5.50,'within_sla',6.20,2.40,'moderate','household_unsegregated','unauthorized_vendor_dumping','IPM CDO Urban Haulers','ABC-4101','resolved','Bags dumped alongside riverwall walkway. Cleared and warning signage placed.','Coordinate with Brgy 1 Tanods for midnight riverwall patrol against illegal dumping.','CLENRO Riverbank Monitor','2026-10-04 17:46:08','2026-10-04 17:46:08'),(18,'CDO-B02-2024-0518','Barangay 2',2,'Capistrano St. Corner Gaerlan St.',8.4758000,124.6441000,'2024-05-18 09:00:00','2024-05-19 16:30:00',31.50,'breached_48h',8.40,3.20,'high','commercial_retail_packaging','delayed_contractor_dispatch','IPM CDO Urban Haulers','ABC-4101','resolved','Contractor missed Saturday morning collection. Commercial boxes spilled onto sidewalk.','Fine contractor ₱10,000 for unannounced route cancellation in commercial poblacion.','Barangay 2 Secretary','2026-10-04 17:46:08','2026-10-04 17:46:08'),(19,'CDO-B07-2024-0825','Barangay 7',7,'Plaza Divisoria Kiosks (Tirso Neri St.)',8.4770000,124.6450000,'2024-08-25 23:00:00','2024-08-26 04:30:00',5.50,'within_sla',11.50,4.60,'high','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9014','resolved','Post-concert festival cleanup completed before sunrise in Divisoria park.','Mandate event organizers to provide private trash receptacles for events exceeding 500 attendees.','CLENRO Event Clearing Crew','2026-10-04 17:46:08','2026-10-04 17:46:08'),(20,'CDO-B10-2024-1014','Barangay 10',10,'Apolinar Velez St. Commercial Strip (Near Dolores St.)',8.4762000,124.6462000,'2024-10-14 07:15:00','2024-10-14 11:30:00',4.25,'within_sla',5.00,1.90,'moderate','commercial_retail_packaging','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4101','resolved','Fast-food cartons piled outside commercial bank. Dispatched small compactor.','Require commercial establishments along Velez St. to maintain internal trash storage bins.','CLENRO Urban Inspector #01','2026-10-04 17:46:08','2026-10-04 17:46:08'),(21,'CDO-B14-2024-1229','Barangay 14',14,'Toribio Chaves St. Corner Tiano Brothers',8.4754000,124.6471000,'2024-12-29 10:00:00','2024-12-30 08:30:00',22.50,'breached_24h',7.80,3.00,'high','household_unsegregated','delayed_contractor_dispatch','IPM CDO Urban Haulers','ABC-4103','resolved','Holiday residential waste buildup on narrow street. Required mini-compactor deployment.','Schedule 3 mini-compactor runs per week during Christmas season for narrow urban alleys.','Barangay 14 Chairperson','2026-10-04 17:46:08','2026-10-04 17:46:08'),(22,'CDO-B21-2025-0211','Barangay 21',21,'Corrales Ave Near Provincial Capitol Rear',8.4795000,124.6468000,'2025-02-11 08:00:00','2025-02-11 13:30:00',5.50,'within_sla',4.50,1.70,'moderate','commercial_retail_packaging','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4103','resolved','Routine clearing completed smoothly.','Maintain current schedule.','CLENRO District 2 Inspector','2026-10-04 17:46:08','2026-10-04 17:46:08'),(23,'CDO-B22-2025-0402','Barangay 22',22,'Bitan-ag Creek Culvert / Luna St. Extension',8.4805000,124.6482000,'2025-04-02 07:30:00','2025-04-04 11:00:00',51.50,'critical_unresolved',13.50,5.40,'critical','drainage_canal_debris','monsoon_drainage_blockage','City In-House Market Sweep Team','LGU-9016','chronic_hotspot','Chronic dumping into Bitan-ag Creek culvert obstructed flow. Excavation crew deployed.','Install permanent steel trash grates and summon Barangay 22 officials for anti-dumping enforcement hearing.','CLENRO Waterways Protection Unit','2026-10-04 17:46:08','2026-10-04 17:46:08'),(24,'CDO-B24-2025-0614','Barangay 24',24,'Apolinar Velez St. - Capitol Park Corner',8.4789000,124.6455000,'2025-06-14 08:30:00','2025-06-14 12:45:00',4.25,'within_sla',3.80,1.40,'low','single_use_plastics','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4103','resolved','Sidewalk trash bins emptied promptly.','Routine monitoring sufficient.','CLENRO Sweeper Supervisor','2026-10-04 17:46:08','2026-10-04 17:46:08'),(25,'CDO-B26-2025-0820','Barangay 26',26,'Justo Ramonal St. Residential Alley',8.4812000,124.6491000,'2025-08-20 09:15:00','2025-08-21 14:00:00',28.75,'breached_48h',9.20,3.60,'high','household_unsegregated','delayed_contractor_dispatch','IPM CDO Urban Haulers','ABC-4104','resolved','Contractor skipped scheduled Tuesday pickup. Barangay captain escalated to CLENRO hotline.','Issue official warning to IPM hauling contractor; penalize route supervisor for skipping Brgy 26.','Barangay 26 Kagawad on Environment','2026-10-04 17:46:08','2026-10-04 17:46:08'),(26,'CDO-B31-2025-1025','Barangay 31',31,'Yacapin St. / Mortola St. Corner',8.4771000,124.6473000,'2025-10-25 18:30:00','2025-10-26 05:00:00',10.50,'within_sla',8.50,3.40,'high','commercial_retail_packaging','unauthorized_vendor_dumping','IPM CDO Urban Haulers','ABC-4102','resolved','Storeowners left cardboard & styrofoam boxes on roadway. Cleared during night collection.','Strictly enforce store packaging fold-and-tie ordinance to reduce haul volume.','CLENRO Commercial Inspector','2026-10-04 17:46:08','2026-10-04 17:46:08'),(27,'CDO-B34-2025-1130','Barangay 34',34,'Osmeña St. Periphery near Cogon Buffer',8.4774000,124.6496000,'2025-11-30 20:00:00','2025-12-01 04:30:00',8.50,'within_sla',12.40,5.00,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','chronic_hotspot','Spillover waste from Cogon boundary cleared by midnight compactor.','Redefine Brgy 34 collection route to sync with Cogon Market night shift sweep.','Barangay 34 Tanod Chief','2026-10-04 17:46:08','2026-10-04 17:46:08'),(28,'CDO-B35-2025-1215','Barangay 35',35,'Bitan-ag Creek Footbridge (Hayes St. Access)',8.4760000,124.6498000,'2025-12-15 11:00:00','2025-12-16 16:30:00',29.50,'breached_48h',10.20,4.10,'high','household_unsegregated','unauthorized_vendor_dumping','City In-House Market Sweep Team','LGU-9016','chronic_hotspot','Residents dumped household garbage along footbridge railings. Hand-cleared into mini-dump truck.','Install community waste station with CCTV and appoint barangay eco-marshal.','CLENRO Urban River Patrol','2026-10-04 17:46:08','2026-10-04 17:46:08'),(29,'CDO-B39-2026-0110','Barangay 39',39,'Capt. Vicente Roa St. Periphery / Alleyway 4',8.4767000,124.6491000,'2026-01-10 19:45:00','2026-01-11 03:00:00',7.25,'within_sla',8.80,3.50,'high','commercial_retail_packaging','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Commercial boxes and fruit trays cleared overnight.','Continue joint coordination between Cogon Market administration and Brgy 39 council.','CLENRO Night Operations','2026-10-04 17:46:08','2026-10-04 17:46:08'),(30,'CDO-B40-2026-0220','Barangay 40',40,'Guillermo St. Boundary / Mortola St.',8.4762000,124.6477000,'2026-02-20 20:15:00','2026-02-21 04:00:00',7.75,'within_sla',7.50,3.00,'moderate','household_unsegregated','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4102','resolved','Cleared on scheduled nighttime collection run.','Schedule remains optimal.','Barangay 40 Kagawad','2026-10-04 17:46:08','2026-10-04 17:46:08'),(31,'CDO-B03-2026-0301','Barangay 3',3,'Fernandez St. Corner Burgos St.',8.4751000,124.6436000,'2026-03-01 09:00:00','2026-03-01 13:30:00',4.50,'within_sla',4.20,1.60,'moderate','household_unsegregated','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4101','resolved','Collected prompt on daytime round.','Maintain weekly Mon-Wed-Fri morning collection schedule.','CLENRO Field Officer #08','2026-10-04 17:46:08','2026-10-04 17:46:08'),(32,'CDO-B04-2026-0315','Barangay 4',4,'Gaerlan St. Near City Central School Outer Wall',8.4764000,124.6445000,'2026-03-15 08:00:00','2026-03-15 11:45:00',3.75,'within_sla',3.50,1.30,'low','single_use_plastics','street_sweeping_backlog','City In-House Market Sweep Team','LGU-9014','resolved','School boundary sidewalk sweep cleared before midday.','Coordinate with school administration for segregated campus bins.','CLENRO School Zone Coordinator','2026-10-04 17:46:08','2026-10-04 17:46:08'),(33,'CDO-B05-2026-0410','Barangay 5',5,'Capistrano St. Near Ysalina Bridge East Approach',8.4769000,124.6438000,'2026-04-10 07:45:00','2026-04-10 12:15:00',4.50,'within_sla',5.10,2.00,'moderate','commercial_retail_packaging','unauthorized_vendor_dumping','IPM CDO Urban Haulers','ABC-4101','resolved','Curb sweep completed; issued reminder notice to adjacent retail shop.','Issue citation if repeat violation occurs within 30 days.','CLENRO Inspector #03','2026-10-04 17:46:08','2026-10-04 17:46:08'),(34,'CDO-B12-2026-0504','Barangay 12',12,'Apolinar Velez St. / Pacana St. Crossing',8.4756000,124.6458000,'2026-05-04 09:30:00','2026-05-04 14:00:00',4.50,'within_sla',4.00,1.50,'low','commercial_retail_packaging','delayed_contractor_dispatch','IPM CDO Urban Haulers','ABC-4101','resolved','Collected on mid-day makeup run.','Ensure contractor driver logs completion on mobile KatokKalinis driver app.','CLENRO Dispatch Desk','2026-10-04 17:46:08','2026-10-04 17:46:08'),(35,'CDO-B18-2026-0622','Barangay 18',18,'Toribio Chaves St. Near Dolores St.',8.4748000,124.6465000,'2026-06-22 08:15:00','2026-06-22 13:00:00',4.75,'within_sla',3.90,1.50,'low','household_unsegregated','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4103','resolved','Sidewalk pile collected on regular schedule.','Maintain current schedule.','Barangay 18 Official','2026-10-04 17:46:08','2026-10-04 17:46:08'),(36,'CDO-B27-2026-0719','Barangay 27',27,'Corrales Ave Near Hayes St. Culvert',8.4788000,124.6475000,'2026-07-19 10:00:00','2026-07-20 09:30:00',23.50,'breached_24h',8.90,3.50,'high','drainage_canal_debris','monsoon_drainage_blockage','City In-House Market Sweep Team','LGU-9016','resolved','Post-rain canal clearing pulled waterlogged plastic and silt. Truck dispatched for pickup.','Inspect culvert bi-weekly during July-September habagat season.','CLENRO Drainage Oversight Team','2026-10-04 17:46:08','2026-10-04 17:46:08'),(37,'CDO-B33-2026-0815','Barangay 33',33,'J.R. Borja St. Corner Guillermo St.',8.4779000,124.6478000,'2026-08-15 21:00:00','2026-08-16 03:30:00',6.50,'within_sla',14.80,6.10,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Pre-Higalaay vendor deliveries generated high volume. Cleared via dedicated night compactor.','Activate 24-hour festival collection taskforce starting August 20.','CLENRO Festival Taskforce','2026-10-04 17:46:08','2026-10-04 17:46:08'),(38,'CDO-B06-2024-0414','Barangay 6',6,'Gomez St. / Pabayo St. Residential Corner',8.4761000,124.6448000,'2024-04-14 08:30:00','2024-04-14 13:00:00',4.50,'within_sla',4.20,1.60,'moderate','household_unsegregated','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4101','resolved','Residential garbage collected on morning run.','Maintain standard weekly route.','Barangay 6 Kagawad','2026-10-04 17:46:08','2026-10-04 17:46:08'),(39,'CDO-B08-2024-0824','Barangay 8',8,'Tirso Neri St. / Divisoria Amphitheater Rear',8.4768000,124.6453000,'2024-08-24 23:30:00','2024-08-25 04:30:00',5.00,'within_sla',15.60,6.20,'critical','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9014','resolved','Higalaay street food kiosks generated large plastic cups & food wrapper pile. Night sweep cleared park before 5 AM.','Require Divisoria night food vendors to deposit waste directly into roving mini-dump trucks rather than curb staging.','CLENRO Park Sanitation Unit','2026-10-04 17:46:08','2026-10-04 17:46:08'),(40,'CDO-B09-2024-1110','Barangay 9',9,'San Agustin Cathedral Perimeter & Fernandez St.',8.4754000,124.6439000,'2024-11-10 11:30:00','2024-11-10 16:00:00',4.50,'within_sla',6.80,2.60,'moderate','commercial_retail_packaging','unauthorized_vendor_dumping','IPM CDO Urban Haulers','ABC-4101','resolved','Sunday churchgoers and surrounding flower vendors left carton and packaging piles. Afternoon pickup executed.','Coordinate with parish administration for cathedral grounds bin segregation.','CLENRO Field Officer #04','2026-10-04 17:46:08','2026-10-04 17:46:08'),(41,'CDO-B11-2024-1228','Barangay 11',11,'Tiano Brothers St. Corner Dolores St.',8.4759000,124.6465000,'2024-12-28 09:00:00','2024-12-29 08:00:00',23.00,'breached_24h',8.40,3.30,'high','commercial_retail_packaging','delayed_contractor_dispatch','IPM CDO Urban Haulers','ABC-4103','resolved','Post-Christmas commercial retail boxes overflowed onto sidewalk. Contractor delayed morning run.','Impose ₱12,500 contractor SLA deduction for 23-hour response breach in downtown commercial corridor.','Barangay 11 Sanitation Head','2026-10-04 17:46:08','2026-10-04 17:46:08'),(42,'CDO-B13-2025-0118','Barangay 13',13,'Capistrano St. Night Cafe Corridor / Eateries',8.4752000,124.6443000,'2025-01-18 22:00:00','2025-01-19 04:00:00',6.00,'within_sla',10.20,4.20,'high','wet_fish_meat_waste','market_closing_overflow','City In-House Market Sweep Team','LGU-9014','resolved','Grease-laden food cartons and organic scrap bags cleared by midnight street crew.','Mandate grease trap installation and separate food waste barrels for downtown restaurants.','CLENRO Sanitation Unit #02','2026-10-04 17:46:08','2026-10-04 17:46:08'),(43,'CDO-B15-2025-0310','Barangay 15',15,'Toribio Chaves St. Near City Health Office',8.4746000,124.6469000,'2025-03-10 08:15:00','2025-03-10 12:45:00',4.50,'within_sla',4.80,1.80,'moderate','commercial_retail_packaging','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4103','resolved','Collected during morning scheduled run.','Maintain current schedule.','Barangay 15 Health Officer','2026-10-04 17:46:08','2026-10-04 17:46:08'),(44,'CDO-B16-2025-0422','Barangay 16',16,'Apolinar Velez St. / Cruz Taal St. Junction',8.4775000,124.6460000,'2025-04-22 09:00:00','2025-04-23 08:30:00',23.50,'breached_24h',7.90,3.10,'high','commercial_retail_packaging','collection_truck_breakdown','IPM CDO Urban Haulers','KDG-8821','resolved','Contractor compactor breakdown halted downtown sector pickup. Backup unit deployed following day.','Mandate contractor to dispatch reserve compactor within 2 hours of mechanical breakdown in primary business district.','CLENRO Dispatch Officer','2026-10-04 17:46:08','2026-10-04 17:46:08'),(45,'CDO-B17-2025-0608','Barangay 17',17,'Cruz Taal St. Near Rizal Park Fringe',8.4766000,124.6455000,'2025-06-08 08:30:00','2025-06-08 13:00:00',4.50,'within_sla',5.20,2.00,'moderate','single_use_plastics','unauthorized_vendor_dumping','City In-House Market Sweep Team','LGU-9014','resolved','Weekend park spectator waste cleared promptly.','Install permanent anti-littering signage under CDO Ordinance 13378.','CLENRO Park Warden','2026-10-04 17:46:08','2026-10-04 17:46:08'),(46,'CDO-B19-2025-0715','Barangay 19',19,'Gen. Luna St. / Corrales Ave Commercial Intersection',8.4784000,124.6470000,'2025-07-15 10:30:00','2025-07-16 11:00:00',24.50,'breached_24h',8.60,3.40,'high','commercial_retail_packaging','delayed_contractor_dispatch','IPM CDO Urban Haulers','ABC-4103','resolved','Commercial waste pile sat uncollected past 24-hour limit. Heavy fines logged.','Issue notice of violation and penalty deduction on contractor billing.','Barangay 19 Council','2026-10-04 17:46:08','2026-10-04 17:46:08'),(47,'CDO-B20-2025-0814','Barangay 20',20,'T. Chavez St. / Pabayo St. Commercial Corner',8.4749000,124.6458000,'2025-08-14 19:30:00','2025-08-15 02:45:00',7.25,'within_sla',6.50,2.50,'moderate','commercial_retail_packaging','unauthorized_vendor_dumping','IPM CDO Urban Haulers','ABC-4101','resolved','Night patrol caught commercial store dumping waste before collection schedule; issued warning.','Eco-Wardens to conduct random nighttime enforcement sweeps.','CLENRO Eco-Warden #05','2026-10-04 17:46:08','2026-10-04 17:46:08'),(48,'CDO-B23-2025-0925','Barangay 23',23,'Hayes St. / Mortola St. Junction (Cogon Perimeter)',8.4772000,124.6486000,'2025-09-25 20:00:00','2025-09-26 03:30:00',7.50,'within_sla',13.80,5.60,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Vegetable stalls boundary spillover cleared during night sweep.','Extend Cogon market compactor coverage 1 block further south into Brgy 23.','Barangay 23 Chairperson','2026-10-04 17:46:08','2026-10-04 17:46:08'),(49,'CDO-B25-2025-1018','Barangay 25',25,'Justo Ramonal St. Extension Near Bitan-ag Canal',8.4815000,124.6488000,'2025-10-18 07:00:00','2025-10-19 14:00:00',31.00,'breached_48h',11.20,4.50,'critical','drainage_canal_debris','monsoon_drainage_blockage','City In-House Market Sweep Team','LGU-9016','chronic_hotspot','Habagat storm caused canal backflow pushing hundreds of plastic bottles onto sidewalk. Backhoe used.','Construct permanent floating trash trap along Justo Ramonal section of Bitan-ag Creek.','CLENRO Waterways Protection Unit','2026-10-04 17:46:08','2026-10-04 17:46:08'),(50,'CDO-B28-2025-1112','Barangay 28',28,'Capt. Vicente Roa St. / Provincial Capitol East Gate',8.4792000,124.6472000,'2025-11-12 08:30:00','2025-11-12 12:45:00',4.25,'within_sla',4.30,1.70,'low','commercial_retail_packaging','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4103','resolved','Offices paper and lunch packaging cleared on schedule.','Maintain current collection frequency.','CLENRO Capitol Liaison','2026-10-04 17:46:08','2026-10-04 17:46:08'),(51,'CDO-B29-2025-1220','Barangay 29',29,'J.R. Borja St. / Corrales Ave Shopping Strip',8.4782000,124.6471000,'2025-12-20 21:00:00','2025-12-21 04:00:00',7.00,'within_sla',16.50,6.80,'critical','commercial_retail_packaging','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Holiday shopping bags & cartons filled curb lanes. Cleared via back-to-back truck runs.','Deploy auxiliary dump truck on J.R. Borja commercial corridor Dec 15 to Jan 5.','CLENRO Commercial Desk','2026-10-04 17:46:08','2026-10-04 17:46:08'),(52,'CDO-B30-2026-0115','Barangay 30',30,'Yacapin St. / Velez St. Junction',8.4773000,124.6465000,'2026-01-15 08:00:00','2026-01-15 13:00:00',5.00,'within_sla',5.60,2.20,'moderate','household_unsegregated','street_sweeping_backlog','IPM CDO Urban Haulers','ABC-4101','resolved','Routine residential pickup completed without incident.','Maintain current morning route.','Barangay 30 Official','2026-10-04 17:46:08','2026-10-04 17:46:08'),(53,'CDO-B32-2026-0210','Barangay 32',32,'Capt. Vicente Roa St. / Osmeña St.',8.4766000,124.6485000,'2026-02-10 19:30:00','2026-02-11 02:45:00',7.25,'within_sla',9.70,3.90,'high','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Fruit vendor discarded peels and rotting produce cleared before morning.','Mandate daily fruit stall waste bin segregation.','CLENRO Market Inspector #02','2026-10-04 17:46:08','2026-10-04 17:46:08'),(54,'CDO-B36-2026-0312','Barangay 36',36,'Limketkai Drive Perimeter / Bitan-ag Creek Culvert',8.4780000,124.6515000,'2026-03-12 08:00:00','2026-03-13 10:30:00',26.50,'breached_48h',14.50,5.80,'critical','drainage_canal_debris','monsoon_drainage_blockage','City In-House Market Sweep Team','LGU-9016','chronic_hotspot','Culvert trash screen choked with styrofoam coolers and shopping bags causing street flooding. Cleared with backhoe.','Schedule bi-weekly mechanical desiltation and fine upstream commercial establishments.','CLENRO Waterways Protection Unit','2026-10-04 17:46:08','2026-10-04 17:46:08'),(55,'CDO-B37-2026-0418','Barangay 37',37,'Valenzuela St. / Agora Boundary Corridor',8.4820000,124.6525000,'2026-04-18 19:00:00','2026-04-19 09:30:00',14.50,'breached_24h',11.80,4.90,'high','wet_fish_meat_waste','delayed_contractor_dispatch','IPM CDO Urban Haulers','KDG-8821','resolved','Fish dealer discarded spoiled seafood crates left overnight on curb. Odor complaints verified by CLENRO.','Deduct ₱15,000 contractor liquidated damages for rotting wet waste breach over 12 hours.','Barangay 37 Sanitation Warden','2026-10-04 17:46:08','2026-10-04 17:46:08'),(56,'CDO-B38-2026-0520','Barangay 38',38,'Gaabucayan St. / Agora Bus Terminal Approach',8.4835000,124.6535000,'2026-05-20 07:30:00','2026-05-20 12:00:00',4.50,'within_sla',6.90,2.70,'moderate','single_use_plastics','street_sweeping_backlog','City In-House Market Sweep Team','LGU-9014','resolved','Bus passenger takeaway containers and drink bottles cleared along highway curb.','Direct terminal management to install 4 high-capacity waste segregators at bus exit gates.','CLENRO Terminal Inspector','2026-10-04 17:46:08','2026-10-04 17:46:08'),(57,'CDO-CGN-2024-0318','Cogon Market Zone',34,'Yacapin St. Night Produce Stalls Corridor',8.4775000,124.6483000,'2024-03-18 21:00:00','2024-03-19 02:30:00',5.50,'within_sla',21.00,8.40,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Post-harvest vegetable deliveries cleared with 2 back-to-back compactor trips.','Require vegetable wholesale trucks to bag leaves and stalks inside truck bed.','Cogon Market Superintendent','2026-10-04 17:46:08','2026-10-04 17:46:08'),(58,'CDO-CGN-2024-0720','Cogon Market Zone',33,'J.R. Borja St. Monsoon Drain Inlets',8.4781000,124.6477000,'2024-07-20 18:00:00','2024-07-21 12:00:00',18.00,'breached_24h',17.50,7.00,'critical','drainage_canal_debris','monsoon_drainage_blockage','IPM CDO Urban Haulers','KDG-8821','chronic_hotspot','Rainstorm flooded street stalls; floating produce jammed drain inlets. Special vacuum truck deployed.','Construct raised concrete curbs along stall boundaries to prevent garbage drift during flash rains.','CLENRO Engineering Liaison','2026-10-04 17:46:08','2026-10-04 17:46:08'),(59,'CDO-CGN-2025-0512','Cogon Market Zone',40,'Guillermo St. Fish Landing Section',8.4765000,124.6480000,'2025-05-12 19:30:00','2025-05-13 02:00:00',6.50,'within_sla',13.50,5.80,'high','wet_fish_meat_waste','market_closing_overflow','City In-House Market Sweep Team','LGU-9014','resolved','Cleared fish entrails and iced water crates. Washed and sanitized street with chlorine spray.','Mandate sealed polyethylene tubs for fish vendors.','CLENRO Sanitation Inspector #09','2026-10-04 17:46:08','2026-10-04 17:46:08'),(60,'CDO-CGN-2025-0826','Cogon Market Zone',39,'Capt. Vicente Roa St. Higalaay Night Market',8.4769000,124.6489000,'2025-08-26 23:45:00','2025-08-27 04:45:00',5.00,'within_sla',26.50,10.80,'critical','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9015','resolved','Higalaay Festival crowd waste cleared in record 5 hours using dual team sweepers.','Deploy 4 additional mobile 1,100L roll-out bins during festival week.','CLENRO Festival Taskforce Lead','2026-10-04 17:46:08','2026-10-04 17:46:08'),(61,'CDO-CGN-2025-1224','Cogon Market Zone',34,'Osmeña St. Holiday Wholesale Produce Section',8.4773000,124.6494000,'2025-12-24 21:00:00','2025-12-25 03:00:00',6.00,'within_sla',31.00,12.50,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Record Christmas Eve produce volume cleared by 3 successive compactor roundtrips.','Schedule continuous rolling compactor dispatch every 2 hours on December 23–24.','Cogon Market Administration','2026-10-04 17:46:08','2026-10-04 17:46:08'),(62,'CDO-CGN-2026-0402','Cogon Market Zone',33,'J.R. Borja St. Frontage (Near Capt. Vicente Roa)',8.4782000,124.6477000,'2026-04-02 20:30:00','2026-04-03 02:45:00',6.25,'within_sla',18.00,7.20,'high','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4102','resolved','Pre-Holy Week market restocking waste cleared smoothly before morning.','Maintain current holiday dispatch matrix.','CLENRO Market Inspector #04','2026-10-04 17:46:08','2026-10-04 17:46:08'),(63,'CDO-CGN-2026-0615','Cogon Market Zone',34,'Yacapin St. Commercial Alley (Mid-Block)',8.4777000,124.6483500,'2026-06-15 19:30:00','2026-06-16 11:00:00',15.50,'breached_24h',14.00,5.60,'high','commercial_retail_packaging','delayed_contractor_dispatch','IPM CDO Urban Haulers','KDG-8821','resolved','Hauler failed evening dispatch. Cleared mid-morning after penalty notification.','Enforce liquidated damages deduction of ₱12,500 under Section 14.','CLENRO Eco-Warden #07','2026-10-04 17:46:08','2026-10-04 17:46:08'),(64,'CDO-CGN-2026-0827','Cogon Market Zone',39,'Capt. Vicente Roa Night Market Strip',8.4768500,124.6489000,'2026-08-27 23:30:00','2026-08-28 04:15:00',4.75,'within_sla',27.50,11.20,'critical','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9014','resolved','Higalaay 2026 festival shopping peak waste cleared under 5 hours. Outstanding team turnaround.','Replicate 2026 festival rapid sweep protocol in future annual celebrations.','CLENRO Festival Taskforce','2026-10-04 17:46:08','2026-10-04 17:46:08'),(65,'CDO-CRM-2024-0415','Carmen Market Zone',NULL,'Seriña St. Wet Section & Poultry Stalls',8.4827500,124.6359000,'2024-04-15 19:00:00','2024-04-16 01:00:00',6.00,'within_sla',12.50,5.40,'high','wet_fish_meat_waste','market_closing_overflow','IPM CDO Urban Haulers','ABC-4105','resolved','Cleared poultry feathers and meat offal; lime powder applied to prevent foul odors.','Mandate wet market stalls to pre-treat organic poultry waste with bio-enzyme spray.','Carmen Market Health Inspector','2026-10-04 17:46:08','2026-10-04 17:46:08'),(66,'CDO-CRM-2024-0722','Carmen Market Zone',NULL,'Carmen Riverbank Canal Culvert (Near Bridge Foot)',8.4838000,124.6388000,'2024-07-22 17:00:00','2024-07-23 15:00:00',22.00,'breached_24h',16.00,6.50,'critical','drainage_canal_debris','monsoon_drainage_blockage','IPM CDO Urban Haulers','ABC-4105','chronic_hotspot','Severe culvert clogging during habagat heavy downpour. Backhoe used to scoop plastic sacks.','Install permanent concrete trash boom barrier across Carmen drainage culvert.','CLENRO River Watch Team','2026-10-04 17:46:08','2026-10-04 17:46:08'),(67,'CDO-CRM-2025-0305','Carmen Market Zone',NULL,'Carmen Public Market - Vamenta Blvd Frontage',8.4831000,124.6364000,'2025-03-05 20:00:00','2025-03-06 01:30:00',5.50,'within_sla',15.00,6.00,'high','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4105','resolved','Post-closing produce trimmings cleared swiftly before morning boulevard traffic.','Maintain 8:00 PM collection dispatch for Vamenta Blvd.','Carmen Market Supervisor','2026-10-04 17:46:08','2026-10-04 17:46:08'),(68,'CDO-CRM-2025-0827','Carmen Market Zone',NULL,'Carmen Bridge Approach / Vamenta Blvd Corner',8.4838500,124.6390000,'2025-08-27 22:15:00','2025-08-28 03:30:00',5.25,'within_sla',22.00,8.80,'critical','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9015','resolved','Higalaay river festival spectators waste cleared in overnight sweep.','Increase temporary festival waste containers along Carmen bridge walkway.','CLENRO Festival Taskforce','2026-10-04 17:46:08','2026-10-04 17:46:08'),(69,'CDO-CRM-2025-1223','Carmen Market Zone',NULL,'Macanhan Commercial Border / Market Rear Exit',8.4819500,124.6350000,'2025-12-23 20:30:00','2025-12-24 03:00:00',6.50,'within_sla',24.50,9.80,'critical','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4105','chronic_hotspot','Holiday market surge cleared by back-to-back truck dispatches.','Position high-capacity mobile dumpster at rear exit during late December peak.','Carmen Market Security','2026-10-04 17:46:08','2026-10-04 17:46:08'),(70,'CDO-CRM-2026-0318','Carmen Market Zone',NULL,'Seriña St. Mid-Market Junction',8.4827000,124.6361000,'2026-03-18 18:30:00','2026-03-19 10:30:00',16.00,'breached_24h',13.00,5.60,'high','wet_fish_meat_waste','delayed_contractor_dispatch','IPM CDO Urban Haulers','KDG-8821','resolved','Contractor skipped evening pickup, cleared mid-morning after sanitation citation issued.','Levy ₱15,000 contractor liquidated damages under Section 14.','CLENRO Sanitation Officer #03','2026-10-04 17:46:08','2026-10-04 17:46:08'),(71,'CDO-CRM-2026-0510','Carmen Market Zone',NULL,'Macanhan Border Alley / Market Rear Access',8.4819000,124.6348000,'2026-05-10 19:00:00','2026-05-12 03:00:00',32.00,'breached_48h',14.50,5.80,'critical','household_unsegregated','unauthorized_vendor_dumping','City In-House Market Sweep Team','LGU-9015','chronic_hotspot','Illegal dumping in rear alley went unattended over weekend. City sweep team dispatched to clear.','Install solar CCTV security camera and impose ₱2,000 fines on caught violators.','CLENRO Eco-Warden Enforcement','2026-10-04 17:46:08','2026-10-04 17:46:08'),(72,'CDO-CRM-2026-0708','Carmen Market Zone',NULL,'Carmen Public Market - Vamenta Blvd Frontage',8.4831200,124.6364000,'2026-07-08 18:30:00','2026-07-09 13:30:00',19.00,'breached_24h',15.80,6.40,'critical','drainage_canal_debris','monsoon_drainage_blockage','IPM CDO Urban Haulers','ABC-4105','chronic_hotspot','Flash rain washed commercial packaging into curbside catchbasins. Required suction pump & loader.','Mandate commercial market tenants to seal all waste containers before 5:00 PM during rainy season.','CLENRO Disaster Coordination Desk','2026-10-04 17:46:08','2026-10-04 17:46:08'),(73,'CDO-CRM-2026-0828','Carmen Market Zone',NULL,'Carmen Bridge Foot (Ysalina Approach Corridor)',8.4839000,124.6391000,'2026-08-28 21:30:00','2026-08-29 02:30:00',5.00,'within_sla',21.50,8.60,'critical','single_use_plastics','market_closing_overflow','City In-House Market Sweep Team','LGU-9015','resolved','Higalaay 2026 river parade spectator plastic waste cleared in record time.','Maintain dedicated post-festival night fleet allocation.','CLENRO Festival Taskforce','2026-10-04 17:46:08','2026-10-04 17:46:08'),(74,'CDO-CRM-2026-0902','Carmen Market Zone',NULL,'Seriña St. Wet Section & Poultry Alleys',8.4828000,124.6358500,'2026-09-02 19:15:00','2026-09-03 00:45:00',5.50,'within_sla',11.50,4.60,'moderate','market_organic_vegetable','market_closing_overflow','IPM CDO Urban Haulers','ABC-4105','resolved','Monthly market cleanup sweep executed on schedule without delays.','Continue regular night collection route.','Carmen Market Supervisor','2026-10-04 17:46:08','2026-10-04 17:46:08');
/*!40000 ALTER TABLE `clenro_pileup_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_log_audits`
--

DROP TABLE IF EXISTS `collection_log_audits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_log_audits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `collection_log_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `collection_log_audits_collection_log_id_foreign` (`collection_log_id`),
  KEY `collection_log_audits_user_id_foreign` (`user_id`),
  CONSTRAINT `collection_log_audits_collection_log_id_foreign` FOREIGN KEY (`collection_log_id`) REFERENCES `collection_logs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collection_log_audits_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_log_audits`
--

LOCK TABLES `collection_log_audits` WRITE;
/*!40000 ALTER TABLE `collection_log_audits` DISABLE KEYS */;
INSERT INTO `collection_log_audits` VALUES (1,1,2,'CREATED',NULL,'{\"unit\": \"tons\", \"notes\": \"plz workz\", \"waste_type\": \"Residual\", \"barangay_name\": \"Barangay 1\", \"amount_collected\": 5}','Initial collection log submitted by driver via mobile app','2026-10-03 04:04:50'),(2,2,2,'CREATED',NULL,'{\"unit\": \"tons\", \"notes\": \"677777\", \"waste_type\": \"Residual\", \"barangay_name\": \"Barangay 2\", \"amount_collected\": 6.7}','Initial collection log submitted by driver via mobile app','2026-10-03 07:50:03'),(3,2,2,'FINALIZED','{\"is_finalized\": false}','{\"finalized_at\": \"2026-10-03T15:50:15.000000Z\", \"is_finalized\": true}','Driver confirmed and finalized entry. Record locked permanently.','2026-10-03 07:50:15'),(4,3,2,'CREATED',NULL,'{\"unit\": \"tons\", \"notes\": \"Goods 67\", \"waste_type\": \"Residual\", \"barangay_name\": \"Barangay 4\", \"amount_collected\": 6.75}','Initial collection log submitted by driver via mobile app','2026-10-19 22:29:32');
/*!40000 ALTER TABLE `collection_log_audits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_logs`
--

DROP TABLE IF EXISTS `collection_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` bigint unsigned NOT NULL,
  `truck_id` bigint unsigned DEFAULT NULL,
  `barangay_id` bigint unsigned DEFAULT NULL,
  `barangay_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_collected` decimal(10,2) NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tons',
  `waste_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Residual',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `idempotency_key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_finalized` tinyint(1) NOT NULL DEFAULT '0',
  `finalized_at` timestamp NULL DEFAULT NULL,
  `server_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `collection_logs_idempotency_key_unique` (`idempotency_key`),
  KEY `collection_logs_truck_id_foreign` (`truck_id`),
  KEY `collection_logs_barangay_id_foreign` (`barangay_id`),
  KEY `collection_logs_driver_id_created_at_index` (`driver_id`,`created_at`),
  KEY `collection_logs_barangay_name_created_at_index` (`barangay_name`,`created_at`),
  KEY `collection_logs_is_finalized_index` (`is_finalized`),
  CONSTRAINT `collection_logs_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE SET NULL,
  CONSTRAINT `collection_logs_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collection_logs_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_logs`
--

LOCK TABLES `collection_logs` WRITE;
/*!40000 ALTER TABLE `collection_logs` DISABLE KEYS */;
INSERT INTO `collection_logs` VALUES (1,2,1,1,'Barangay 1',5.00,'tons','Residual','plz workz','dlog-164f5964-de84-4fe4-a7b0-33b1bdf41138-1791029096757',0,NULL,'2026-10-03 04:04:50','2026-10-03 04:04:50','2026-10-03 04:04:50'),(2,2,1,2,'Barangay 2',6.70,'tons','Residual','677777','dlog-bbdfb1b2-890b-4288-b390-5911dc6e7e80-1791042610270',1,'2026-10-03 07:50:15','2026-10-03 07:50:03','2026-10-03 07:50:03','2026-10-03 07:50:15'),(3,2,1,49,'Barangay 4',6.75,'tons','Residual','Goods 67','dlog-07e8934b-38eb-4dca-bfa8-54c97947e66b-1792477773516',0,NULL,'2026-10-19 22:29:32','2026-10-19 22:29:32','2026-10-19 22:29:32');
/*!40000 ALTER TABLE `collection_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_collection_logs_prevent_update` BEFORE UPDATE ON `collection_logs` FOR EACH ROW BEGIN
                    IF OLD.is_finalized = 1 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Disallowed: Finalized collection log is permanently locked and cannot be edited.';
                    END IF;

                    IF OLD.is_finalized = 1 AND NEW.is_finalized = 0 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Disallowed: Finalized status cannot be reversed.';
                    END IF;
                END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_collection_logs_prevent_delete` BEFORE DELETE ON `collection_logs` FOR EACH ROW BEGIN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Disallowed: Collection logs are insert-only records and can never be deleted.';
                END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `collection_routes`
--

DROP TABLE IF EXISTS `collection_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_routes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `truck_id` bigint unsigned NOT NULL,
  `barangay_id` bigint unsigned NOT NULL,
  `collection_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collection_routes_truck_id_foreign` (`truck_id`),
  KEY `collection_routes_barangay_id_foreign` (`barangay_id`),
  CONSTRAINT `collection_routes_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collection_routes_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_routes`
--

LOCK TABLES `collection_routes` WRITE;
/*!40000 ALTER TABLE `collection_routes` DISABLE KEYS */;
INSERT INTO `collection_routes` VALUES (1,2,1,'2026-10-02','07:30:00','09:45:00','completed','Full Poblacion route cleared.','2026-10-04 17:46:11','2026-10-04 17:46:11'),(2,3,2,'2026-10-03','08:00:00','09:50:00','completed','Commercial sector emptied.','2026-10-04 17:46:11','2026-10-04 17:46:11'),(3,5,3,'2026-10-04','08:15:00','10:00:00','completed','Wet market perimeter collection complete.','2026-10-04 17:46:11','2026-10-04 17:46:11'),(4,2,1,'2026-10-05','07:00:00','08:45:00','completed','Stop 1 of 4: Barangay 1 Civic Center cleared.','2026-10-04 17:46:11','2026-10-04 17:46:11'),(5,5,2,'2026-10-05','08:50:00','10:15:00','completed','Stop 2 of 4: Barangay 2 Main Ave cleared.','2026-10-04 17:46:11','2026-10-04 17:46:11'),(6,3,3,'2026-10-05','10:30:00','11:45:00','completed','Stop 3 of 4: Barangay 3 Commercial hub cleared.','2026-10-04 17:46:11','2026-10-04 17:46:11'),(7,5,4,'2026-10-05','13:00:00',NULL,'in_progress','Stop 4 of 4: Active collection in Barangay 4.','2026-10-04 17:46:11','2026-10-04 17:46:11');
/*!40000 ALTER TABLE `collection_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_schedules`
--

DROP TABLE IF EXISTS `collection_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_schedules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barangay_id` bigint unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `day` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_time` time NOT NULL,
  `schedule_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'regular',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collection_schedules_barangay_id_foreign` (`barangay_id`),
  CONSTRAINT `collection_schedules_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_schedules`
--

LOCK TABLES `collection_schedules` WRITE;
/*!40000 ALTER TABLE `collection_schedules` DISABLE KEYS */;
INSERT INTO `collection_schedules` VALUES (1,1,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(2,1,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(3,1,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(4,2,'2026-09-06','Sunday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(5,2,'2026-09-13','Sunday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(6,2,'2026-09-17','Thursday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(7,3,'2026-09-08','Tuesday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(8,3,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(9,3,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(10,4,'2026-09-07','Monday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(11,4,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(12,4,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(13,5,'2026-09-06','Sunday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(14,5,'2026-09-13','Sunday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(15,5,'2026-09-17','Thursday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(16,6,'2026-09-08','Tuesday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(17,6,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(18,6,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(19,7,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(20,7,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(21,7,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(22,8,'2026-09-06','Sunday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(23,8,'2026-09-13','Sunday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(24,8,'2026-09-17','Thursday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(25,9,'2026-09-08','Tuesday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(26,9,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(27,9,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(28,10,'2026-09-07','Monday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(29,10,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(30,10,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(31,11,'2026-09-06','Sunday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(32,11,'2026-09-13','Sunday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(33,11,'2026-09-17','Thursday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(34,12,'2026-09-08','Tuesday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(35,12,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(36,12,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(37,13,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(38,13,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(39,13,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(40,14,'2026-09-06','Sunday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(41,14,'2026-09-13','Sunday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(42,14,'2026-09-17','Thursday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(43,15,'2026-09-08','Tuesday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(44,15,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(45,15,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(46,16,'2026-09-07','Monday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(47,16,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(48,16,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(49,17,'2026-09-06','Sunday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(50,17,'2026-09-13','Sunday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(51,17,'2026-09-17','Thursday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(52,18,'2026-09-08','Tuesday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(53,18,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(54,18,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(55,19,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(56,19,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(57,19,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(58,20,'2026-09-06','Sunday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(59,20,'2026-09-13','Sunday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(60,20,'2026-09-17','Thursday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(61,21,'2026-09-08','Tuesday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(62,21,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(63,21,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(64,22,'2026-09-07','Monday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(65,22,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(66,22,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(67,23,'2026-09-06','Sunday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(68,23,'2026-09-13','Sunday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(69,23,'2026-09-17','Thursday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(70,24,'2026-09-08','Tuesday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(71,24,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(72,24,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(73,25,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(74,25,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(75,25,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(76,26,'2026-09-06','Sunday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(77,26,'2026-09-13','Sunday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(78,26,'2026-09-17','Thursday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(79,27,'2026-09-08','Tuesday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(80,27,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(81,27,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(82,28,'2026-09-07','Monday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(83,28,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(84,28,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(85,29,'2026-09-06','Sunday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(86,29,'2026-09-13','Sunday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(87,29,'2026-09-17','Thursday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(88,30,'2026-09-08','Tuesday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(89,30,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(90,30,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(91,31,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(92,31,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(93,31,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(94,32,'2026-09-06','Sunday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(95,32,'2026-09-13','Sunday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(96,32,'2026-09-17','Thursday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(97,33,'2026-09-08','Tuesday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(98,33,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(99,33,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(100,34,'2026-09-07','Monday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(101,34,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(102,34,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(103,35,'2026-09-06','Sunday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(104,35,'2026-09-13','Sunday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(105,35,'2026-09-17','Thursday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(106,36,'2026-09-08','Tuesday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(107,36,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(108,36,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(109,37,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(110,37,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(111,37,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(112,38,'2026-09-06','Sunday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(113,38,'2026-09-13','Sunday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(114,38,'2026-09-17','Thursday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(115,39,'2026-09-08','Tuesday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(116,39,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(117,39,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(118,40,'2026-09-07','Monday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-10 21:41:14','2026-09-11 02:06:07'),(119,40,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(120,40,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-10 21:41:14','2026-09-11 02:06:07'),(121,1,NULL,'Saturday','09:30:00','regular','Next weekly collection run.',1,'scheduled','2026-09-10 21:51:30','2026-09-10 21:51:30'),(122,1,'2026-09-19','Saturday','09:30:00','regular','Next weekly collection run.',1,'scheduled','2026-09-10 22:02:41','2026-09-10 22:02:41'),(123,41,'2026-09-06','Sunday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-11 01:27:28','2026-09-11 02:06:07'),(124,41,'2026-09-13','Sunday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-11 01:27:28','2026-09-11 02:06:07'),(125,41,'2026-09-17','Thursday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-11 01:27:28','2026-09-11 02:06:07'),(126,42,'2026-09-08','Tuesday','08:00:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-11 01:27:28','2026-09-11 02:06:07'),(127,42,'2026-09-12','Saturday','08:00:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-11 01:27:28','2026-09-11 02:06:07'),(128,42,'2026-09-16','Wednesday','08:00:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-11 01:27:28','2026-09-11 02:06:07'),(129,43,'2026-09-07','Monday','09:30:00','regular','Biodegradable & Recyclable waste collection completed.',1,'completed','2026-09-11 01:27:28','2026-09-11 02:06:07'),(130,43,'2026-09-12','Saturday','09:30:00','regular','Regular residential waste collection. Please place segregated bins outside before 8:00 AM.',1,'scheduled','2026-09-11 01:27:28','2026-09-11 02:06:07'),(131,43,'2026-09-16','Wednesday','09:30:00','regular','Upcoming residual & recyclable waste collection run.',1,'scheduled','2026-09-11 01:27:28','2026-09-11 02:06:07'),(132,1,'2026-09-14','Monday','18:51:00','regular',NULL,1,'scheduled','2026-09-14 00:51:59','2026-09-14 00:51:59'),(133,1,'2026-10-05','Monday','07:00:00','Biodegradable & Commercial',NULL,1,'completed','2026-10-04 17:46:11','2026-10-19 15:37:53'),(134,2,'2026-10-05','Monday','08:30:00','Residual & Residential',NULL,1,'completed','2026-10-04 17:46:11','2026-10-04 17:46:11'),(135,3,'2026-10-05','Monday','10:30:00','Recyclable Packaging',NULL,1,'completed','2026-10-04 17:46:11','2026-10-04 17:46:11'),(136,4,'2026-10-05','Monday','13:00:00','Market & Commercial',NULL,1,'in_progress','2026-10-04 17:46:11','2026-10-04 17:46:11'),(137,12,'2026-10-05','Monday','15:30:00','Secondary Residential',NULL,1,'scheduled','2026-10-04 17:46:11','2026-10-04 17:46:11'),(138,1,'2026-10-06','Tuesday','08:00:00','Special Bulky Waste Pickup',NULL,1,'completed','2026-10-04 17:46:11','2026-10-19 15:38:13'),(139,2,'2026-10-07','Wednesday','08:30:00','Commercial Stalls & Yard Waste',NULL,1,'completed','2026-10-04 17:46:11','2026-10-19 15:38:40'),(140,12,'2026-10-21','Wednesday','10:14:00','regular',NULL,1,'scheduled','2026-10-19 15:14:33','2026-10-19 15:32:15'),(141,12,'2026-11-20','Friday','12:37:00','regular',NULL,1,'scheduled','2026-10-19 15:37:28','2026-10-19 15:37:28');
/*!40000 ALTER TABLE `collection_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractors`
--

DROP TABLE IF EXISTS `contractors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contractor_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contractors_contractor_code_unique` (`contractor_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractors`
--

LOCK TABLES `contractors` WRITE;
/*!40000 ALTER TABLE `contractors` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contractor_id` bigint unsigned NOT NULL,
  `contract_value` decimal(15,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `performance` decimal(5,2) NOT NULL DEFAULT '0.00',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_contractor_id_foreign` (`contractor_id`),
  CONSTRAINT `contracts_contractor_id_foreign` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `license_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `performance_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `merits` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `drivers_license_number_unique` (`license_number`),
  KEY `drivers_user_id_foreign` (`user_id`),
  CONSTRAINT `drivers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,2,'DL-2026-9812',98.50,15,'2026-09-11 02:06:06','2026-09-11 02:06:06');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `resident_id` bigint unsigned NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','reviewed','acknowledged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `feedback_resident_id_foreign` (`resident_id`),
  CONSTRAINT `feedback_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,7,'Great garbage collection schedule updates!','new','2026-09-14 00:26:50','2026-09-14 00:26:50'),(2,5,'blep','new','2026-10-03 07:33:18','2026-10-03 07:33:18'),(3,5,'[Service Quality] good astig 5/5','new','2026-10-03 07:46:47','2026-10-03 07:46:47');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspections`
--

DROP TABLE IF EXISTS `inspections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned NOT NULL,
  `inspector_id` bigint unsigned NOT NULL,
  `hygiene_system` int NOT NULL DEFAULT '0',
  `condition_of_premises` int NOT NULL DEFAULT '0',
  `total_score` int NOT NULL DEFAULT '0',
  `compliance_level` int NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `pending_hygiene_system` int DEFAULT NULL,
  `pending_condition_of_premises` int DEFAULT NULL,
  `pending_total_score` int DEFAULT NULL,
  `pending_notes` text COLLATE utf8mb4_unicode_ci,
  `change_requested_by` bigint unsigned DEFAULT NULL,
  `change_requested_at` timestamp NULL DEFAULT NULL,
  `change_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','completed','reviewed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `decision` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `decided_by` bigint unsigned DEFAULT NULL,
  `decided_at` timestamp NULL DEFAULT NULL,
  `inspected_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inspections_vendor_id_foreign` (`vendor_id`),
  KEY `inspections_inspector_id_foreign` (`inspector_id`),
  KEY `inspections_decided_by_foreign` (`decided_by`),
  KEY `inspections_change_requested_by_foreign` (`change_requested_by`),
  CONSTRAINT `inspections_change_requested_by_foreign` FOREIGN KEY (`change_requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inspections_decided_by_foreign` FOREIGN KEY (`decided_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inspections_inspector_id_foreign` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inspections_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspections`
--

LOCK TABLES `inspections` WRITE;
/*!40000 ALTER TABLE `inspections` DISABLE KEYS */;
INSERT INTO `inspections` VALUES (1,3,3,85,80,83,83,'Clean food storage and well-maintained waste disposal area.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','accepted',1,'2026-09-14 01:13:12','2026-09-10 22:55:19','2026-09-11 00:55:19','2026-09-14 01:13:12'),(2,1,3,80,80,80,80,'Good sanitation, clean food display and proper waste bin segregation.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed',NULL,NULL,NULL,'2026-09-14 01:32:53','2026-09-14 01:32:53','2026-09-14 01:32:53'),(3,1,3,100,100,100,100,'Good sanitation, clean food display and proper waste bin segregation.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed',NULL,NULL,NULL,'2026-09-14 01:33:35','2026-09-14 01:33:35','2026-09-14 01:33:35'),(4,3,3,80,100,90,90,'k lang',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed',NULL,NULL,NULL,'2026-10-03 04:09:25','2026-10-03 04:09:25','2026-10-03 04:09:25'),(5,1,3,100,100,100,100,'oks lang',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','accepted',1,'2026-10-04 19:28:55','2026-10-03 04:10:05','2026-10-03 04:10:05','2026-10-04 19:28:55'),(6,2,3,20,20,20,20,'paano to',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed',NULL,NULL,NULL,'2026-10-03 04:10:36','2026-10-03 04:10:36','2026-10-03 04:10:36'),(7,1,3,100,100,100,100,'sawadika',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','accepted',1,'2026-10-04 19:28:17','2026-10-03 07:52:31','2026-10-03 07:52:31','2026-10-04 19:28:17'),(8,1,14,95,90,92,92,'Excellent segregation, covered bins with municipal color-coded liners.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','accepted',NULL,NULL,'2026-10-02 16:00:00','2026-10-04 17:46:11','2026-10-04 17:46:11'),(9,2,3,85,80,82,82,'Good sanitation and proper waste bin segregation.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','accepted',NULL,NULL,'2026-10-03 16:00:00','2026-10-04 17:46:11','2026-10-04 17:46:11'),(10,3,14,70,65,68,68,'Minor grease trap overflow. Requires secondary inspection within 5 days.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','accepted',NULL,NULL,'2026-10-01 16:00:00','2026-10-04 17:46:11','2026-10-04 17:46:11'),(11,4,3,50,45,48,48,'Unsegregated refuse piled outside stall. Sanitary violation notice issued.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','rejected',NULL,NULL,'2026-09-30 16:00:00','2026-10-04 17:46:11','2026-10-04 17:46:11'),(12,5,14,88,84,86,86,'Vegetable trimming waste stored in compostable bins.',NULL,NULL,NULL,NULL,NULL,NULL,'none',NULL,'completed','accepted',NULL,NULL,'2026-10-04 16:00:00','2026-10-04 17:46:11','2026-10-04 17:46:11'),(13,1,3,70,80,75,75,'Stall cleanliness needs attention, waste bin lid was open during inspection.',80,80,80,'Stall cleanliness needs attention, waste bin lid was open during inspection.',3,'2026-10-19 21:41:04','pending','Photo evidence inconclusive. Please re-audit stall tomorrow.','completed','accepted',1,'2026-10-04 20:22:46','2026-10-04 20:22:46','2026-10-04 18:33:19','2026-10-19 21:41:04');
/*!40000 ALTER TABLE `inspections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspectors`
--

DROP TABLE IF EXISTS `inspectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspectors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `badge_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inspectors_badge_number_unique` (`badge_number`),
  KEY `inspectors_user_id_foreign` (`user_id`),
  CONSTRAINT `inspectors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspectors`
--

LOCK TABLES `inspectors` WRITE;
/*!40000 ALTER TABLE `inspectors` DISABLE KEYS */;
INSERT INTO `inspectors` VALUES (1,3,'INSP-2026-007','2026-09-11 02:06:06','2026-09-11 02:06:06');
/*!40000 ALTER TABLE `inspectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_08_17_110526_create_roles_table',1),(5,'2026_08_17_110630_create_user_roles_table',1),(6,'2026_08_17_112641_create_personal_access_tokens_table',1),(7,'2026_08_18_123403_create_contracts_table',1),(8,'2026_08_19_163444_create_barangays_table',1),(9,'2026_08_19_163445_create_vendors_table',1),(10,'2026_08_19_163446_create_collection_schedules_table',1),(11,'2026_08_19_163447_500000_create_trucks_table',1),(12,'2026_08_19_163447_create_reports_table',1),(13,'2026_08_19_163448_000000_create_truck_locations_table',1),(14,'2026_08_19_163449_create_collection_routes_table',1),(15,'2026_08_19_163452_create_inspections_table',1),(16,'2026_08_20_000000_create_contractors_table',1),(17,'2026_08_20_021943_fix_contracts_contractor_foreign_key',1),(18,'2026_08_20_030049_fix_trucks_contractor_foreign_key',1),(19,'2026_08_20_030255_fix_trucks_contractor_foreign_key',1),(20,'2026_08_20_030415_change_trucks_contractor_foreign_key_to_contractors',1),(21,'2026_08_21_081341_update_reports_table_for_admin',1),(22,'2026_08_21_081553_fix_reports_status',1),(23,'2026_08_21_085708_create_attendances_table',1),(24,'2026_08_21_091129_add_attendance_fields_to_attendances_table',1),(25,'2026_08_25_000000_create_activity_logs_table',1),(26,'2026_08_25_010000_add_decision_to_inspections_table',1),(27,'2026_08_25_020000_add_date_and_status_to_collection_schedules_table',1),(28,'2026_08_25_030000_add_employee_profile_fields_to_users_table',1),(29,'2026_09_04_100000_create_clenro_pileup_reports_table',1),(30,'2026_08_25_160328_create_drivers_table',2),(31,'2026_08_25_160331_create_inspectors_table',2),(32,'2026_08_25_160333_create_tasks_table',2),(33,'2026_08_25_160334_create_feedback_table',2),(34,'2026_08_25_160336_create_notifications_table',2),(35,'2026_08_25_160338_create_violations_table',2),(36,'2026_08_25_164643_add_points_to_vendors_table',2),(37,'2026_09_14_094010_change_image_column_in_reports_table',3),(38,'2026_10_01_000001_create_collection_logs_and_audits_tables',4),(39,'2026_10_03_000001_add_avatar_and_barangay_to_users_table',5),(40,'2026_09_23_000000_add_archived_fields_to_users_table',6),(41,'2026_09_23_010000_add_archived_fields_to_attendances_table',6),(42,'2026_10_05_030000_add_pending_change_to_inspections_table',7),(43,'2026_10_20_000001_add_compliance_scores_to_vendors_table',8);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,8,'Sanitation Evaluation Approved','Your official stall sanitation evaluation has been updated: Grade C (75%).','evaluation',0,'2026-10-04 19:22:38','2026-10-04 19:22:38'),(2,8,'Sanitation Evaluation Approved','Your official stall sanitation evaluation has been updated: Grade A (90%).','evaluation',0,'2026-10-04 20:18:38','2026-10-04 20:18:38'),(3,8,'Sanitation Evaluation Approved','Your official stall sanitation evaluation has been updated: Grade C (75%).','evaluation',0,'2026-10-04 20:22:46','2026-10-04 20:22:46'),(4,5,'Compactor Arrival Advisory','Collection compactor truck will arrive in Barangay 12 at 10:00 AM. Please prepare waste bins.','advisory',0,'2026-10-19 16:47:49','2026-10-19 16:47:49'),(5,7,'Compactor Arrival Advisory','Collection compactor truck will arrive in Barangay 12 at 10:00 AM. Please prepare waste bins.','advisory',0,'2026-10-19 16:47:49','2026-10-19 16:47:49'),(6,15,'Compactor Arrival Advisory','Collection compactor truck will arrive in Barangay 12 at 10:00 AM. Please prepare waste bins.','advisory',0,'2026-10-19 16:47:49','2026-10-19 16:47:49'),(7,19,'Compactor Arrival Advisory','Collection compactor truck will arrive in Barangay 12 at 10:00 AM. Please prepare waste bins.','advisory',0,'2026-10-19 16:47:49','2026-10-19 16:47:49'),(8,5,'Official Cleanliness Advisory','Waste segregation and compactor collection is scheduled for Barangay 12 today.','advisory',0,'2026-10-19 16:53:54','2026-10-19 16:53:54'),(9,7,'Official Cleanliness Advisory','Waste segregation and compactor collection is scheduled for Barangay 12 today.','advisory',0,'2026-10-19 16:53:54','2026-10-19 16:53:54'),(10,15,'Official Cleanliness Advisory','Waste segregation and compactor collection is scheduled for Barangay 12 today.','advisory',0,'2026-10-19 16:53:54','2026-10-19 16:53:54'),(11,19,'Official Cleanliness Advisory','Waste segregation and compactor collection is scheduled for Barangay 12 today.','advisory',0,'2026-10-19 16:53:54','2026-10-19 16:53:54'),(12,1,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(13,2,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(14,3,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(15,4,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(16,5,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(17,6,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(18,7,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(19,9,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(20,11,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(21,12,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(22,13,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(23,14,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(24,16,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(25,17,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(26,18,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(27,19,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(28,20,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(29,21,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(30,22,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(31,23,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(32,8,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(33,15,'hi','wyd','schedule',0,'2026-10-19 17:21:32','2026-10-19 17:21:32'),(34,5,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(35,6,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(36,7,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(37,15,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(38,16,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(39,17,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(40,18,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(41,19,'hello po','astig','schedule',0,'2026-10-19 17:22:20','2026-10-19 17:22:20'),(42,1,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(43,2,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(44,3,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(45,4,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(46,5,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(47,6,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(48,7,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(49,9,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(50,11,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(51,12,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(52,13,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(53,14,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(54,16,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(55,17,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(56,18,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(57,19,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(58,20,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(59,21,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(60,22,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(61,23,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(62,8,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(63,15,'Collection Schedule for Barangay 1-5','11:00AM to 1:00PM','schedule',0,'2026-10-19 17:24:31','2026-10-19 17:24:31'),(64,1,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(65,2,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(66,3,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(67,4,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(68,5,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(69,6,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(70,7,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(71,9,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(72,11,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(73,12,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(74,13,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(75,14,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(76,16,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(77,17,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(78,18,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(79,19,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(80,20,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(81,21,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(82,22,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(83,23,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(84,8,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40'),(85,15,'hi','hhii','schedule',0,'2026-10-19 17:28:40','2026-10-19 17:28:40');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'katokkalinis-web','01cecc0dc92105d0d88a037195e498616f65c279a5aca7763a265218c28e41bc','[\"*\"]','2026-09-08 06:14:06',NULL,'2026-09-08 05:59:26','2026-09-08 06:14:06'),(2,'App\\Models\\User',2,'katokkalinis-web','cdb668a50d9ef858eb30411daf303bf8b7358beafe9eb62481b9bfef481834f0','[\"*\"]',NULL,NULL,'2026-09-08 06:16:06','2026-09-08 06:16:06'),(3,'App\\Models\\User',1,'katokkalinis-web','175598846338323c6dabe4e628dad8785bf09df38c1154e330dabbf05760164d','[\"*\"]',NULL,NULL,'2026-09-10 19:33:48','2026-09-10 19:33:48'),(4,'App\\Models\\User',2,'katokkalinis-web','ec313b242bf02ab90b05224e59e688d4f421e4f3780da27729fdc33ad1a945d2','[\"*\"]',NULL,NULL,'2026-09-10 19:35:02','2026-09-10 19:35:02'),(5,'App\\Models\\User',3,'katokkalinis-web','26a49f3cd4411e53ee44ea989ff27735b33a7f55d41b918e7d416e9c76d54211','[\"*\"]',NULL,NULL,'2026-09-10 19:35:37','2026-09-10 19:35:37'),(6,'App\\Models\\User',1,'katokkalinis-web','52ce640b0e28d9bcb6a55b113c44fb00fa726fc720f1e060d152793f6f5544f1','[\"*\"]','2026-09-10 19:36:35',NULL,'2026-09-10 19:36:35','2026-09-10 19:36:35'),(7,'App\\Models\\User',1,'katokkalinis-web','ed9c87abbdc1bbbe09582499e4192a406a30ba3433d3e8e114de73b0a147d78b','[\"*\"]','2026-09-10 19:36:46',NULL,'2026-09-10 19:36:45','2026-09-10 19:36:46'),(8,'App\\Models\\User',2,'katokkalinis-web','0287ad033ac8663d383721143967bc0b475cafb94784a4805409f2207c993712','[\"*\"]',NULL,NULL,'2026-09-10 19:41:54','2026-09-10 19:41:54'),(9,'App\\Models\\User',3,'katokkalinis-web','9f78a53fcc8ef04d679d783080dbed4847de27ebd09f30dab986259066130376','[\"*\"]','2026-09-10 19:44:23',NULL,'2026-09-10 19:42:58','2026-09-10 19:44:23'),(10,'App\\Models\\User',5,'katokkalinis-mobile','93c1baacf2c4cd3fe48dbe7f0beb86599f00e86eb4f4fbe70962a25079d7fe65','[\"*\"]',NULL,NULL,'2026-09-10 19:46:50','2026-09-10 19:46:50'),(11,'App\\Models\\User',5,'katokkalinis-web','b2c2fe8193c85337b0be998eb8683d3c9149bb06b5505d7542a975a9fa7314e0','[\"*\"]','2026-09-10 19:49:20',NULL,'2026-09-10 19:47:08','2026-09-10 19:49:20'),(12,'App\\Models\\User',2,'katokkalinis-web','ab48f8d4df98d84616f280ef45e26ec3fb72362a71e5887d43b32429d6c4937a','[\"*\"]','2026-09-10 20:43:05',NULL,'2026-09-10 20:43:03','2026-09-10 20:43:05'),(13,'App\\Models\\User',1,'katokkalinis-web','129882e45f14438db3d63431b2c3501a2bd8d276479cc30963d2cfa31e738c32','[\"*\"]',NULL,NULL,'2026-09-10 23:40:38','2026-09-10 23:40:38'),(14,'App\\Models\\User',6,'katokkalinis-mobile','119cf79cb2e0b6d7e619bce76e5e45a6983e15de2d1f02882972a672a09fff7b','[\"*\"]',NULL,NULL,'2026-09-10 23:56:18','2026-09-10 23:56:18'),(15,'App\\Models\\User',6,'katokkalinis-web','44477c51fa93a4569d3dbec1a82f904cb1168514efad4a78bc121262f1604d06','[\"*\"]','2026-09-11 00:04:53',NULL,'2026-09-10 23:56:35','2026-09-11 00:04:53'),(16,'App\\Models\\User',2,'katokkalinis-web','ed0c6440b0605f0302cc7dc72d47bdbc7064a4faebc7faac38b17fb6829b87f0','[\"*\"]','2026-09-11 00:09:32',NULL,'2026-09-11 00:06:15','2026-09-11 00:09:32'),(17,'App\\Models\\User',3,'katokkalinis-web','bcdead01a03b610e12a15f97ad80dd221fd74f5240d1320415895c4bb9161f7d','[\"*\"]','2026-09-11 00:35:15',NULL,'2026-09-11 00:13:10','2026-09-11 00:35:15'),(18,'App\\Models\\User',2,'katokkalinis-web','1e098fe9b2065095199a955bd344d088cf9ec576765955670d02f2c4443e8804','[\"*\"]','2026-09-11 00:36:00',NULL,'2026-09-11 00:35:46','2026-09-11 00:36:00'),(19,'App\\Models\\User',6,'katokkalinis-web','baa61c09dd35aa71a778972f772ec6702eb90d23945df1611a48ff3c9f12c455','[\"*\"]',NULL,NULL,'2026-09-11 00:37:42','2026-09-11 00:37:42'),(20,'App\\Models\\User',6,'katokkalinis-web','a43454ffb3ed3397169125960af79da1bb750a78fb485ca68f8fe9e9304ec2e2','[\"*\"]','2026-09-11 01:43:53',NULL,'2026-09-11 01:39:33','2026-09-11 01:43:53'),(21,'App\\Models\\User',10,'katokkalinis-mobile','9077f6ac31231fa6a7e29ef9d4874dea873427a7fb793ad180634e63e2f3d65e','[\"*\"]','2026-09-11 03:17:50',NULL,'2026-09-11 03:12:27','2026-09-11 03:17:50'),(22,'App\\Models\\User',6,'katokkalinis-web','cce306ca959bc4dcc386f7cb23ab1ae902a8709188c86c20fe5937ef4583b098','[\"*\"]',NULL,NULL,'2026-09-11 03:57:02','2026-09-11 03:57:02'),(23,'App\\Models\\User',5,'katokkalinis-web','a6f2d53da488f6a68f933c72f38887c97196df1e49f87c0878209453a14a735b','[\"*\"]','2026-09-11 04:01:43',NULL,'2026-09-11 03:57:51','2026-09-11 04:01:43'),(24,'App\\Models\\User',2,'katokkalinis-web','2fcc4cb9a43ab1d588afecf7dc17272dd628d3712e84e5aa4a9e465c2ecefd27','[\"*\"]',NULL,NULL,'2026-09-11 04:02:17','2026-09-11 04:02:17'),(25,'App\\Models\\User',3,'katokkalinis-web','c385cbfbdbf831a245872991c1886fbde78f1519ec4ccbbf09ac71d5dd2630ed','[\"*\"]','2026-09-11 04:07:24',NULL,'2026-09-11 04:04:42','2026-09-11 04:07:24'),(26,'App\\Models\\User',9,'katokkalinis-web','bd3608c6d0d76cf6cd06b51d1d2c27e19818dab76cdbed9ae40ab69cd831a5ba','[\"*\"]','2026-09-14 00:00:08',NULL,'2026-09-14 00:00:07','2026-09-14 00:00:08'),(27,'App\\Models\\User',7,'katokkalinis-web','f5c93601ba39484613d03dd057a2756238f534a3acac934d30a2661b27efb254','[\"*\"]','2026-09-14 00:26:51',NULL,'2026-09-14 00:26:50','2026-09-14 00:26:51'),(28,'App\\Models\\User',8,'katokkalinis-web','3f7425d6a861f84d18ec39a3a0ce9693a464dce9caa4d304187cc5cfb2bead27','[\"*\"]','2026-09-14 00:26:51',NULL,'2026-09-14 00:26:51','2026-09-14 00:26:51'),(29,'App\\Models\\User',1,'katokkalinis-web','f63a6232decabbdfbc0cfb3083ed56d6bff4f44dce8419d84d8ca24903b597fc','[\"*\"]','2026-09-14 00:26:52',NULL,'2026-09-14 00:26:52','2026-09-14 00:26:52'),(30,'App\\Models\\User',1,'katokkalinis-web','f1a816cde37a27c007b3fb7c31935dcd8f66393fee7c8da03eae58c82cbb023b','[\"*\"]',NULL,NULL,'2026-09-14 00:27:29','2026-09-14 00:27:29'),(31,'App\\Models\\User',9,'katokkalinis-web','c76461d8dfee3fb1518fb18ed0855af67afaf7a43c55f00f5f9d0fcb6fe9fb26','[\"*\"]',NULL,NULL,'2026-09-14 00:27:38','2026-09-14 00:27:38'),(32,'App\\Models\\User',2,'katokkalinis-web','c7122bd00890901befbbb53f24f6fb9f183fd532bf7c30ef3b879cc4f2863bef','[\"*\"]',NULL,NULL,'2026-09-14 00:27:47','2026-09-14 00:27:47'),(33,'App\\Models\\User',3,'katokkalinis-web','d0bcb1cb69688e7b497a5e2dc237ec03f12220016355421c1e98239185fa192f','[\"*\"]',NULL,NULL,'2026-09-14 00:27:57','2026-09-14 00:27:57'),(34,'App\\Models\\User',9,'katokkalinis-web','bd4857c17a884ac1eb434f80949525e71ecca0ce5ee3cd628cfeb4a021e9519f','[\"*\"]','2026-09-14 01:11:33',NULL,'2026-09-14 00:50:54','2026-09-14 01:11:33'),(35,'App\\Models\\User',2,'katokkalinis-web','20d3cd9118b5bd227611d6bb8ca6376aab61063adc2c373758a9b2067ed7371a','[\"*\"]','2026-09-14 00:57:06',NULL,'2026-09-14 00:56:57','2026-09-14 00:57:06'),(36,'App\\Models\\User',5,'katokkalinis-web','37e93a7a207e057c3b7454c2f46cb4b2e9ec1bca10aba2209d2f3bf80b44083a','[\"*\"]','2026-09-14 01:01:26',NULL,'2026-09-14 00:59:39','2026-09-14 01:01:26'),(37,'App\\Models\\User',3,'katokkalinis-web','5f766adaae59bb8a8d25bd968349d622a72f07fd631d87233a087cfc89ee0779','[\"*\"]','2026-09-14 01:02:32',NULL,'2026-09-14 01:01:52','2026-09-14 01:02:32'),(38,'App\\Models\\User',1,'katokkalinis-web','9b6502661fee784869c6eb808e44c4dd67c3b17538298c378e8131957a04dba7','[\"*\"]','2026-09-14 02:22:59',NULL,'2026-09-14 01:11:47','2026-09-14 02:22:59'),(39,'App\\Models\\User',5,'katokkalinis-web','e4cfb4a4f076910cac7fd15625c931eb005dd328c5f787c44fca64ce99abee5f','[\"*\"]','2026-09-14 01:23:48',NULL,'2026-09-14 01:23:02','2026-09-14 01:23:48'),(40,'App\\Models\\User',3,'katokkalinis-web','324f7ff900addc5e5a50604041732a4419a2c2bb89d651597f62df890c7cade1','[\"*\"]','2026-09-14 01:25:01',NULL,'2026-09-14 01:24:50','2026-09-14 01:25:01'),(41,'App\\Models\\User',3,'katokkalinis-web','42b4691de0c72b1aaa9582637cbfc38cbe645f6d5099ad05bc81b31571cc80a4','[\"*\"]','2026-09-14 01:26:09',NULL,'2026-09-14 01:25:57','2026-09-14 01:26:09'),(42,'App\\Models\\User',2,'katokkalinis-web','94cc819d3918d18526b643e7d3676bce1e6afa638f3ba077a942fa3919ae7142','[\"*\"]','2026-09-14 01:26:45',NULL,'2026-09-14 01:26:38','2026-09-14 01:26:45'),(43,'App\\Models\\User',3,'katokkalinis-web','38d4e6b13e9c3d5fa1eaf35bce3255f48a02e5636ff0d5cb051572a922c090c8','[\"*\"]','2026-09-14 01:33:39',NULL,'2026-09-14 01:32:22','2026-09-14 01:33:39'),(44,'App\\Models\\User',1,'katokkalinis-web','8501c1d9818930438491d2fc825a321480c4bd744d5d846b405f13779ec771c2','[\"*\"]','2026-09-14 01:57:43',NULL,'2026-09-14 01:57:43','2026-09-14 01:57:43'),(45,'App\\Models\\User',1,'katokkalinis-web','7846a44107b8929da8b3edbe431d5b46afb17fed3ce1f62bc221161dbcab44dc','[\"*\"]','2026-09-14 02:04:58',NULL,'2026-09-14 02:04:58','2026-09-14 02:04:58'),(46,'App\\Models\\User',1,'katokkalinis-web','bb699a15c4b0ee379983e992652562f497c1fc2c9c6dc77271f021dcc56ef351','[\"*\"]','2026-09-14 02:05:39',NULL,'2026-09-14 02:05:39','2026-09-14 02:05:39'),(47,'App\\Models\\User',1,'katokkalinis-web','16cbee9cc0dfcf1e95c05b2fce51b84f838e9833ee8e15d28003605dd51f2d52','[\"*\"]',NULL,NULL,'2026-09-14 02:48:52','2026-09-14 02:48:52'),(48,'App\\Models\\User',1,'katokkalinis-web','106b1d42f13fae2fb9fa909025bd525a14c44b2c803bce03bfb79c28129e671b','[\"*\"]','2026-09-14 03:14:02',NULL,'2026-09-14 02:49:29','2026-09-14 03:14:02'),(49,'App\\Models\\User',9,'katokkalinis-web','dd127e14dfa863080dea75b36eabcb305e14debe8988cef28555fb5853a7458d','[\"*\"]',NULL,NULL,'2026-10-03 03:55:00','2026-10-03 03:55:00'),(50,'App\\Models\\User',2,'katokkalinis-web','6b78c62eb0f203b29e8e83fb887057b22268846374496cfa26502f6facda380d','[\"*\"]','2026-10-03 04:06:20',NULL,'2026-10-03 04:04:16','2026-10-03 04:06:20'),(51,'App\\Models\\User',3,'katokkalinis-web','ed1c8908e8a45e41526fb49e1060a263390c94cf56d3b55e574c5eca15b700ba','[\"*\"]','2026-10-03 04:11:17',NULL,'2026-10-03 04:07:20','2026-10-03 04:11:17'),(52,'App\\Models\\User',5,'katokkalinis-web','a3cf6ef7c222765104cedac767774f2d54df8139257f797428d18a1b3348a4be','[\"*\"]','2026-10-03 07:33:47',NULL,'2026-10-03 04:14:18','2026-10-03 07:33:47'),(53,'App\\Models\\User',2,'katokkalinis-web','29194fb0a23a1d3115eea9612a3c16739e15a3dea6b1f937207b1741e726041d','[\"*\"]','2026-10-03 07:35:17',NULL,'2026-10-03 07:34:16','2026-10-03 07:35:17'),(54,'App\\Models\\User',5,'katokkalinis-web','6e9e606265cf7bd784985340dff3979b1014fbe067fd2f1103acb694c07c23ba','[\"*\"]','2026-10-03 07:48:42',NULL,'2026-10-03 07:39:58','2026-10-03 07:48:42'),(55,'App\\Models\\User',2,'katokkalinis-web','aac0975b5e954337d5f55d11cfdcd3911d4669e1c0f81bf8cd6c7ee9a968bb1e','[\"*\"]','2026-10-03 07:50:59',NULL,'2026-10-03 07:49:00','2026-10-03 07:50:59'),(56,'App\\Models\\User',3,'katokkalinis-web','8d8a9725d60fe81a8c14c6428753a871f422ab94a9595bfa066a25e57ae8df57','[\"*\"]','2026-10-03 07:53:12',NULL,'2026-10-03 07:51:21','2026-10-03 07:53:12'),(57,'App\\Models\\User',1,'katokkalinis-web','b4adbfd7738c1fdfeafb147f3620bda658c32d25ce7edd1d120080e5c149ed48','[\"*\"]','2026-10-04 20:34:56',NULL,'2026-10-04 17:49:37','2026-10-04 20:34:56'),(58,'App\\Models\\User',8,'katokkalinis-web','3c33e72d41180d489dbcb478b57e6c342bd29c426efef52559ddcd08478b5ec6','[\"*\"]','2026-10-04 18:32:22',NULL,'2026-10-04 18:04:30','2026-10-04 18:32:22'),(59,'App\\Models\\User',3,'katokkalinis-web','894d8ed1ee7a35370ecf6d695cee8caf6df010d88222634736d34f8c0b11ddb9','[\"*\"]','2026-10-04 18:33:37',NULL,'2026-10-04 18:32:41','2026-10-04 18:33:37'),(60,'App\\Models\\User',8,'katokkalinis-web','5e4d2b3c7c99eedfd9f7aaf58865bccc6e4194a75c2335216e7e73aa57446237','[\"*\"]','2026-10-04 19:29:09',NULL,'2026-10-04 18:34:14','2026-10-04 19:29:09'),(61,'App\\Models\\User',3,'katokkalinis-web','8dddd61af7e952f78826b3ae3cb08f97b44dc831c4a3f41dd33352eeafa56c7d','[\"*\"]','2026-10-04 19:22:37',NULL,'2026-10-04 19:22:37','2026-10-04 19:22:37'),(62,'App\\Models\\User',9,'katokkalinis-web','6e8b0a62debb827e0c2e24150b63a746c29ea4f55b618a0a6761cc2328932e01','[\"*\"]','2026-10-04 19:22:38',NULL,'2026-10-04 19:22:38','2026-10-04 19:22:38'),(63,'App\\Models\\User',3,'katokkalinis-web','1d2ea758cd61c16a2b1247ecbceaf2fbb2598119035565cf51bc45d46993fadf','[\"*\"]','2026-10-04 19:22:55',NULL,'2026-10-04 19:22:54','2026-10-04 19:22:55'),(64,'App\\Models\\User',9,'katokkalinis-web','b04cb5d35a1b606693e14ad6bca28bb8a5620316e5258a8fa4d221344246cad8','[\"*\"]','2026-10-04 19:22:55',NULL,'2026-10-04 19:22:55','2026-10-04 19:22:55'),(65,'App\\Models\\User',3,'katokkalinis-web','61d991e11bff91a061d0596ca40cb0692c09fa46839e2e2bca226dcc1fd30b0b','[\"*\"]','2026-10-04 19:31:17',NULL,'2026-10-04 19:29:34','2026-10-04 19:31:17'),(66,'App\\Models\\User',9,'katokkalinis-web','800726acc9136b5adcf48146fefe290965cd6307cd73a25481545a867084b244','[\"*\"]','2026-10-04 20:12:23',NULL,'2026-10-04 20:12:23','2026-10-04 20:12:23'),(67,'App\\Models\\User',9,'katokkalinis-web','13952e6308b1690ec419df243b643ad3369506b07349e83b32c852bbc34e5ec4','[\"*\"]','2026-10-04 20:12:56',NULL,'2026-10-04 20:12:56','2026-10-04 20:12:56'),(68,'App\\Models\\User',2,'katokkalinis-web','79e5d1c7f5c115a1ed0327d060abcea2a07b5437dad0713c20162bcf467d462d','[\"*\"]',NULL,NULL,'2026-10-19 14:34:13','2026-10-19 14:34:13'),(69,'App\\Models\\User',2,'katokkalinis-web','89660fb798a40086d5fab3264f1f4147e1d1f4908edd2bcfd7bc7386e368cb1d','[\"*\"]',NULL,NULL,'2026-10-19 14:47:12','2026-10-19 14:47:12'),(70,'App\\Models\\User',1,'katokkalinis-web','dae31701e06644db61ef097fc7dd27ac616886c8ed0b06773a0424477cf9aa17','[\"*\"]','2026-10-19 22:34:41',NULL,'2026-10-19 15:11:57','2026-10-19 22:34:41'),(71,'App\\Models\\User',5,'katokkalinis-web','575cfa97012cff17b6eefd4c5313c1c6ad1400907b4b64dfb6ec4c1c13796a2f','[\"*\"]','2026-10-19 17:27:42',NULL,'2026-10-19 15:13:17','2026-10-19 17:27:42'),(72,'App\\Models\\User',8,'katokkalinis-web','0eb8272004d3cd7203c85462f359975081e506866f666405fe9d89adee111cdf','[\"*\"]','2026-10-19 20:21:01',NULL,'2026-10-19 17:28:23','2026-10-19 20:21:01'),(73,'App\\Models\\User',8,'katokkalinis-web','70bc78ebe4f617fad04da0c9ba81612de2fde898e719d3be068175b687cb0d3d','[\"*\"]','2026-10-19 22:23:23',NULL,'2026-10-19 20:20:30','2026-10-19 22:23:23'),(74,'App\\Models\\User',3,'katokkalinis-web','dccb6e62d3a859c1a4cbc83ada1472bb430c048a7137b86eff380f064124ea59','[\"*\"]','2026-10-19 20:22:08',NULL,'2026-10-19 20:21:33','2026-10-19 20:22:08'),(75,'App\\Models\\User',3,'katokkalinis-web','ca40bf3346be8cb67754177f599326fb40779a5393f0b12f9ee2b05150175fc5','[\"*\"]','2026-10-19 21:42:58',NULL,'2026-10-19 21:40:47','2026-10-19 21:42:58'),(76,'App\\Models\\User',2,'katokkalinis-web','c148de0303bdb78efbd56e0dbf56a2e330ba1aa70be650bc7cf922cca9fa43f2','[\"*\"]','2026-10-20 06:35:34',NULL,'2026-10-19 21:43:35','2026-10-20 06:35:34'),(77,'App\\Models\\User',1,'katokkalinis-web','f17f2a14cf6e83f2a2f4095e8a8c4205fa0e451f53742c67266f295065463934','[\"*\"]','2026-10-20 06:26:49',NULL,'2026-10-20 06:21:21','2026-10-20 06:26:49'),(78,'App\\Models\\User',9,'katokkalinis-web','0ec66c67bdee3511c5384823e02a9f089692446235a83e5bb022dd3918b62e36','[\"*\"]','2026-10-20 06:27:28',NULL,'2026-10-20 06:21:29','2026-10-20 06:27:28'),(79,'App\\Models\\User',1,'katokkalinis-web','fb85c544eb9d82398fbaafd91f7205de3dee636903670723281208727a2e3e1a','[\"*\"]',NULL,NULL,'2026-10-20 06:26:01','2026-10-20 06:26:01'),(80,'App\\Models\\User',1,'katokkalinis-web','df9f6bb725d41bc31a04fe5de0be52c722cde724dfc8161e49e45f0bf4c188d2','[\"*\"]','2026-10-20 06:36:11',NULL,'2026-10-20 06:31:26','2026-10-20 06:36:11'),(81,'App\\Models\\User',1,'katokkalinis-web','5460db1584f604e3f41e0d619f2e746a8965f02d6894d887637af4c6445c35b7','[\"*\"]','2026-10-20 06:36:18',NULL,'2026-10-20 06:36:17','2026-10-20 06:36:18');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `barangay_id` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `image` longtext COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','reviewed','resolved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_user_id_foreign` (`user_id`),
  KEY `reports_barangay_id_foreign` (`barangay_id`),
  CONSTRAINT `reports_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,1,12,'Uncollected garbage','Garbage accumulated near street corner','Barangay 12, Cagayan de Oro City',NULL,NULL,NULL,'pending','2026-09-10 23:50:16','2026-09-10 23:50:16'),(2,1,1,'toky','john toky','Barangay 1, Cagayan de Oro City',NULL,NULL,'/storage/reports/demo_evidence.png','pending','2026-09-11 01:41:27','2026-09-14 01:48:05'),(3,7,12,'Test Sanitation Issue','Trash bin overflow at main market corner.','Barangay 12, Cagayan de Oro City',NULL,NULL,'https://example.com/test.jpg','pending','2026-09-14 00:26:50','2026-09-14 00:26:50'),(5,5,2,'baho','ewy','Barangay 2, Cagayan de Oro City',NULL,NULL,'/storage/reports/report_1791029806_6ac0f22e8b984.jpeg','pending','2026-10-03 04:16:46','2026-10-03 04:16:46'),(6,5,2,'baho baho','hehe baho','Barangay 2, Cagayan de Oro City',NULL,NULL,'/storage/reports/report_1791041506_6ac11fe269fe1.jpeg','pending','2026-10-03 07:31:46','2026-10-03 07:31:46'),(7,5,12,'miming nga gamay dani','naay miming nga gamay dani','Barangay 12, Cagayan de Oro City',NULL,NULL,'/storage/reports/report_1791042129_6ac12251ba069.jpeg','pending','2026-10-03 07:42:09','2026-10-03 07:42:09'),(8,15,1,'Uncollected commercial waste near fruit stalls','Commercial pile accumulating near north market entrance bay. Requires compactor truck clearing.','Barangay 1 Market Entrance Bay',NULL,NULL,'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80','pending','2026-10-04 15:46:11','2026-10-04 17:46:11'),(9,16,2,'Damaged segregated waste container','Municipal color-coded bin cracked at corner, municipal liner missing.','Barangay 2 Capistrano St.',NULL,NULL,'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80','pending','2026-10-04 12:46:11','2026-10-04 17:46:11'),(10,17,3,'Illegal roadside dumping along perimeter alley','Construction debris and discarded cardboard boxes left on sidewalk overnight.','Barangay 3 Velez Extension',NULL,NULL,NULL,'reviewed','2026-10-04 09:46:11','2026-10-04 17:46:11'),(11,18,4,'Missed morning pickup for residential block','Truck arrived earlier than 8:00 AM; three bins remained uncollected on Purok 3.','Barangay 4 Purok 3',NULL,NULL,NULL,'reviewed','2026-10-03 17:46:11','2026-10-04 17:46:11'),(12,19,12,'Garbage pile-up cleared successfully','Resolved: CLENRO compactor unit arrived and fully cleared pile at 9:15 AM.','Barangay 12 Apolinar Velez St.',NULL,NULL,NULL,'resolved','2026-10-02 17:46:11','2026-10-04 17:46:11');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'resident','Resident user','2026-10-04 17:46:06','2026-10-04 17:46:06'),(2,'vendor','Public market vendor','2026-10-04 17:46:06','2026-10-04 17:46:06'),(3,'driver','Garbage truck driver','2026-10-04 17:46:06','2026-10-04 17:46:06'),(4,'inspector','Sanitation inspector','2026-10-04 17:46:06','2026-10-04 17:46:06'),(5,'barangay_admin','Barangay administrator','2026-10-04 17:46:06','2026-10-04 17:46:06'),(6,'contractor','Waste management contractor','2026-10-04 17:46:06','2026-10-04 17:46:06'),(7,'employee','KatokKalinis employee','2026-10-04 17:46:06','2026-10-04 17:46:06'),(8,'super_admin','System administrator','2026-10-04 17:46:06','2026-10-04 17:46:06'),(9,'admin','Barangay or System Administrator','2026-10-04 17:46:06','2026-10-04 17:46:06');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('svvw3ZOVoEOwUhGD2EoWkvWq2JKeQpzRbTqALKjo',NULL,'192.168.18.174','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 OPR/136.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoid3BOTFdWa0c5bzRjV242b3V2OGN3VDZURW1iTDNRNXdaakRXT2JsdCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjY6Imh0dHA6Ly8xOTIuMTY4LjE4LjE3NDo4MDAwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1791164943);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` bigint unsigned NOT NULL,
  `collection_schedule_id` bigint unsigned NOT NULL,
  `status` enum('pending','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `current_gps_lat` decimal(10,8) DEFAULT NULL,
  `current_gps_lng` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_driver_id_foreign` (`driver_id`),
  KEY `tasks_collection_schedule_id_foreign` (`collection_schedule_id`),
  CONSTRAINT `tasks_collection_schedule_id_foreign` FOREIGN KEY (`collection_schedule_id`) REFERENCES `collection_schedules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truck_locations`
--

DROP TABLE IF EXISTS `truck_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truck_locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `truck_id` bigint unsigned NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `speed` decimal(8,2) DEFAULT NULL,
  `heading` decimal(8,2) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `truck_locations_truck_id_recorded_at_index` (`truck_id`,`recorded_at`),
  CONSTRAINT `truck_locations_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truck_locations`
--

LOCK TABLES `truck_locations` WRITE;
/*!40000 ALTER TABLE `truck_locations` DISABLE KEYS */;
INSERT INTO `truck_locations` VALUES (1,1,8.4542000,124.6319000,24.50,NULL,'2026-09-11 02:06:06','2026-09-11 02:06:06','2026-09-11 02:06:06');
/*!40000 ALTER TABLE `truck_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trucks`
--

DROP TABLE IF EXISTS `trucks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trucks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `truck_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plate_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` bigint unsigned DEFAULT NULL,
  `contractor_id` bigint unsigned DEFAULT NULL,
  `truck_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('available','on_route','maintenance','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trucks_truck_number_unique` (`truck_number`),
  UNIQUE KEY `trucks_plate_number_unique` (`plate_number`),
  KEY `trucks_driver_id_foreign` (`driver_id`),
  KEY `trucks_contractor_id_foreign` (`contractor_id`),
  CONSTRAINT `trucks_contractor_id_foreign` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `trucks_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trucks`
--

LOCK TABLES `trucks` WRITE;
/*!40000 ALTER TABLE `trucks` DISABLE KEYS */;
INSERT INTO `trucks` VALUES (1,'Truck #04','ABC-1234',2,NULL,'Compactor','available','2026-09-11 02:06:06','2026-10-19 22:17:04'),(2,'TRK-01','KAL-101',11,NULL,'Compactor','available','2026-10-04 17:46:08','2026-10-04 17:46:09'),(3,'TRK-02','KAL-102',12,NULL,'Dump Truck','available','2026-10-04 17:46:08','2026-10-04 17:46:09'),(4,'TRK-03','KAL-103',2,NULL,'Rear-Loader Compactor','available','2026-10-04 17:46:08','2026-10-04 17:46:08'),(5,'TRK-04','KAL-104',13,NULL,'Compactor Truck','available','2026-10-04 17:46:08','2026-10-20 06:34:29');
/*!40000 ALTER TABLE `trucks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_roles_user_id_role_id_unique` (`user_id`,`role_id`),
  KEY `user_roles_role_id_foreign` (`role_id`),
  CONSTRAINT `user_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,8,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(2,2,3,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(3,3,4,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(4,4,3,NULL,NULL),(5,5,1,NULL,NULL),(6,6,1,NULL,NULL),(7,7,1,'2026-09-11 02:06:06','2026-09-11 02:06:06'),(8,8,2,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(9,9,9,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(11,11,3,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(12,12,3,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(13,13,3,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(14,14,4,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(15,15,1,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(16,16,1,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(17,17,1,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(18,18,1,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(19,19,1,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(20,20,2,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(21,21,2,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(22,22,2,'2026-10-04 17:46:11','2026-10-04 17:46:11'),(23,23,2,'2026-10-04 17:46:11','2026-10-04 17:46:11');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` longtext COLLATE utf8mb4_unicode_ci,
  `barangay_id` bigint unsigned DEFAULT NULL,
  `joined_at` date DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  `archived_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_barangay_id_foreign` (`barangay_id`),
  CONSTRAINT `users_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Super Administrator','superadmin@katokkalinis.com','09467802945','City Hall, Cagayan de Oro',NULL,NULL,NULL,NULL,'$2y$12$GSZd1/xZWq7rsxkLfpuK/eG5AJUfkvU6LkEHIOBhwlvL9Lvqg7DKO',0,NULL,NULL,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(2,'John Driver','driver@katokkalinis.com','09467802942','Barangay 10, Cagayan de Oro',NULL,NULL,NULL,NULL,'$2y$12$qc/tJP/dkF7x.b/.ThJ/ruUBNna.xuS/Ggc4N.m8Osrse7vC2uVm2',0,NULL,NULL,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(3,'John Inspector','inspector@katokkalinis.com','09467802943','City Health & Sanitation Office, Cagayan de Oro',NULL,NULL,NULL,NULL,'$2y$12$jRs1.35zKrvDZfi8aQS2zu4qLf8u1DDiJ6ogVIsj.UAd9r.RRuLa6',0,NULL,NULL,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(4,'Toky Toky','paler@gmail.com','09234783583','Zone 4 CDO',NULL,NULL,'2026-09-08',NULL,'$2y$12$m1Dkc.QkAJS1wrSKhBUL5OC0m4rpyMSLDOxg77z2FnEEXMQ/ORXFy',0,NULL,NULL,'2026-09-08 06:08:52','2026-09-08 06:08:52'),(5,'Toky Chungmanirat','mikay@katokkalinis.com','09467802940','Barangay 12, Cagayan de Oro','/storage/avatars/avatar_5_1792459510.jpeg',NULL,NULL,NULL,'$2y$12$w3UGDCjOlzwa2hc1qTB7Ne42TuTNizQWNWgFPZMAqCIw6zpWGe9Oa',0,NULL,NULL,'2026-09-10 19:46:50','2026-10-19 17:25:10'),(6,'John','john@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,'$2y$12$wZhXAIcMhcbs13W21.71VuyFDgDKXML9FaY3rH2NANwcH0yVPL/p6',0,NULL,NULL,'2026-09-10 23:56:18','2026-09-10 23:56:18'),(7,'Katok Resident','resident@katokkalinis.com','09467802940','Barangay 12, Cagayan de Oro',NULL,NULL,NULL,NULL,'$2y$12$8egRUMMjnPvVOdIaZ5FlUekPTNRMTZfp/SkpMRY0l17rTpSLsOKFS',0,NULL,NULL,'2026-09-11 02:06:06','2026-09-11 02:06:06'),(8,'Juan Dela Cruz','vendor@katokkalinis.com','09467802940','Barangay 1','/storage/avatars/avatar_8_1791166062.jpeg',1,NULL,NULL,'$2y$12$hIJDOAZ4rr1zXrK9xzYkWuN/gc2cZsZrU1KnBt5ANLKYrD8WBbyF.',0,NULL,NULL,'2026-10-04 17:46:07','2026-10-04 18:07:43'),(9,'System Administrator','admin@katokkalinis.com','09467802944','City Hall, Cagayan de Oro',NULL,NULL,NULL,NULL,'$2y$12$g0kyon1EDlUf44RhrXNEuu.uI05JmK6n1wLwI21Q3dDRhvZfKZWAC',0,NULL,NULL,'2026-10-04 17:46:07','2026-10-04 17:46:07'),(11,'Juan Driver','juan.driver@katokkalinis.com',NULL,NULL,NULL,NULL,'2026-10-05',NULL,'$2y$12$avEuYol.v2znW.p26ztE.OSKHzh6tgAqx0JX9bJ31OUxc9TPkzap2',0,NULL,NULL,'2026-10-04 17:46:08','2026-10-04 17:46:08'),(12,'Ramon Bautista','ramon.driver@katokkalinis.com',NULL,NULL,NULL,NULL,'2026-10-05',NULL,'$2y$12$R69B/x9mkvMyr8Uj55dQHOTkH4go4zvUBJc0oJ8QVlRiEt7ilJdsa',0,NULL,NULL,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(13,'Carlos Mendoza','carlos.driver@katokkalinis.com',NULL,NULL,NULL,NULL,'2026-10-05',NULL,'$2y$12$AZyyyBOojPiyM1M5hiO1y.wQY4jcPuxheydM0bzxiOrhfUDZSX8du',0,NULL,NULL,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(14,'Maria Inspector','maria.inspector@katokkalinis.com',NULL,NULL,NULL,NULL,'2026-10-05',NULL,'$2y$12$Aqc2.QsiXGh7LiRcbS261eB5koFsAVyciay3McnEv8e4yko99N5yC',0,NULL,NULL,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(15,'Jane Doe','jane.doe@katokkalinis.com','09171234561','Barangay 12, Cagayan de Oro City',NULL,12,'2026-10-05',NULL,'$2y$12$GgxSfuBP5bLIQjIiMrdHzeUbWZdplLH7PneuEQpe7/2kWHSuxWOZu',0,NULL,NULL,'2026-10-04 17:46:09','2026-10-19 16:41:29'),(16,'Pedro Penduko','pedro.p@katokkalinis.com','09181234562','Barangay 2',NULL,NULL,'2026-10-05',NULL,'$2y$12$25.VblEutKyBWnVVc/BeKeDLp909FmQ517/3LpH6gylt60tTvo5Ry',0,NULL,NULL,'2026-10-04 17:46:09','2026-10-04 17:46:09'),(17,'Liza Soberano','liza.s@katokkalinis.com','09191234563','Barangay 3',NULL,NULL,'2026-10-05',NULL,'$2y$12$rEWEFZRPecopuTneuEMKzeoH2VCEXfJQ4zcxj/BjuzdsKsqlLWNHC',0,NULL,NULL,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(18,'Mark Santos','mark.s@katokkalinis.com','09201234564','Barangay 4',NULL,NULL,'2026-10-05',NULL,'$2y$12$drmp7tCsw8ImcWwkp5bJm.qoGzLAPtZExPkBMvpP/yTz5FmFq7AR6',0,NULL,NULL,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(19,'Elena Cruz','elena.c@katokkalinis.com','09211234565','Barangay 12',NULL,NULL,'2026-10-05',NULL,'$2y$12$XJBWJDtwIpeRsgelrR0mJu3tYl95jz6BgAh5oZiZhtbwZ52JZO5/S',0,NULL,NULL,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(20,'Aling Nena Store','aling.nena@katokkalinis.com','09351234567','Barangay 2',NULL,NULL,'2026-10-05',NULL,'$2y$12$eibyzM/GtzKBDdCqQ8GrH.PAUsWa97UMTeL92JxsuanOQpngBN3.G',0,NULL,NULL,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(21,'Mang Tomas Meat','mang.tomas@katokkalinis.com','09471234568','Barangay 3',NULL,NULL,'2026-10-05',NULL,'$2y$12$8SX2m5/q3X2DJ0S0075kiOeXwni16RiSWBHxIr6GCEcL.GRym.K4K',0,NULL,NULL,'2026-10-04 17:46:10','2026-10-04 17:46:10'),(22,'Cogon Dry Goods','cogon.goods@katokkalinis.com','09561234569','Barangay 4',NULL,NULL,'2026-10-05',NULL,'$2y$12$SpHuzSpH6bupAKUeZmcgVO1iWEf7.qwfsXQeWmvTYX1fG35xKX9Fa',0,NULL,NULL,'2026-10-04 17:46:11','2026-10-04 17:46:11'),(23,'Carmen Fresh Veggies','carmen.veg@katokkalinis.com','09661234570','Barangay 12',NULL,NULL,'2026-10-05',NULL,'$2y$12$sJdtIc98sHkt5uN07sJWTO3N/uHDbtijsV37pyx9yPwNaRiy4vScq',0,NULL,NULL,'2026-10-04 17:46:11','2026-10-04 17:46:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `barangay_id` bigint unsigned DEFAULT NULL,
  `vendor_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `market` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stall_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `qr_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `sanitation_score` decimal(4,1) NOT NULL DEFAULT '0.0',
  `compliance_score` int NOT NULL DEFAULT '0',
  `compliance_grade` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'N/A',
  `violations_count` int NOT NULL DEFAULT '0',
  `last_inspected_at` timestamp NULL DEFAULT NULL,
  `points` int NOT NULL DEFAULT '100',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendors_vendor_code_unique` (`vendor_code`),
  UNIQUE KEY `vendors_qr_code_unique` (`qr_code`),
  KEY `vendors_user_id_foreign` (`user_id`),
  KEY `vendors_barangay_id_foreign` (`barangay_id`),
  CONSTRAINT `vendors_barangay_id_foreign` FOREIGN KEY (`barangay_id`) REFERENCES `barangays` (`id`) ON DELETE SET NULL,
  CONSTRAINT `vendors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,8,1,'2026012345','KatokKalimpyo Fruit Stall','Juan Dela Cruz','Divisoria Public Market','Stall #12','09467802940','Barangay 1, Divisoria','2026012345','active',7.5,75,'B',0,'2026-10-04 20:22:46',100,NULL,'2026-10-04 17:46:07'),(2,20,2,'2026012346','Aling Nena Sari-Sari Store','Nena Santos','Cogon Public Market','Stall #45','09351234567','Barangay 2, Cogon','2026012346','active',8.2,82,'B',0,'2026-10-03 16:00:00',100,NULL,NULL),(3,21,3,'2026012347','Mang Tomas Fresh Meat Section','Tomas Rodriguez','Carmen Public Market','Wet Section #08','09471234568','Barangay 3, Carmen','2026012347','active',6.7,67,'C',0,'2026-10-01 16:00:00',100,NULL,NULL),(4,22,4,'2026012348','Cogon Dry Goods & Apparel','Clara Reyes','Cogon Public Market','Stall #102','09561234569','Barangay 4, Cogon','2026012348','active',4.7,47,'C',0,'2026-09-30 16:00:00',100,NULL,NULL),(5,23,12,'2026012349','Carmen Fresh Vegetables Hub','Ricardo Dalisay','Carmen Public Market','Stall #15','09661234570','Barangay 12, Carmen','2026012349','active',8.6,86,'A',0,'2026-10-04 16:00:00',100,NULL,NULL);
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violations`
--

DROP TABLE IF EXISTS `violations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned NOT NULL,
  `inspection_id` bigint unsigned NOT NULL,
  `violation_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `penalty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `corrective_action` text COLLATE utf8mb4_unicode_ci,
  `status` enum('open','resolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `violations_vendor_id_foreign` (`vendor_id`),
  KEY `violations_inspection_id_foreign` (`inspection_id`),
  CONSTRAINT `violations_inspection_id_foreign` FOREIGN KEY (`inspection_id`) REFERENCES `inspections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `violations_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violations`
--

LOCK TABLES `violations` WRITE;
/*!40000 ALTER TABLE `violations` DISABLE KEYS */;
/*!40000 ALTER TABLE `violations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-20 22:38:31
