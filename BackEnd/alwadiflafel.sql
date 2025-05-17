-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 12, 2024 at 09:52 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alwadiflafel`
--

-- --------------------------------------------------------

--
-- Table structure for table `dishes`
--

CREATE TABLE `dishes` (
  `ID` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dishes`
--

INSERT INTO `dishes` (`ID`, `name`, `price`, `allergies`, `description`, `image_path`, `is_active`) VALUES
(1, 'Spaghetti Carbonara', 12.99, 'Dairy, Eggs', 'Classic Italian pasta dish', '/uploads/1720006052865-136227301.png', 1),
(2, 'Margherita Pizza', 10.99, 'Dairy', 'Tomato, mozzarella, and basil', '/uploads/1720006100117-944714057.png', 1),
(3, 'Caesar Salad', 8.99, 'Dairy, Eggs', 'Romaine lettuce with Caesar dressing', '/uploads/1720006087770-858203562.png', 1),
(4, 'Chicken Alfredo', 14.99, 'Dairy', 'Pasta with creamy Alfredo sauce and chicken', '/uploads/1720006076313-577309190.png', 1),
(5, 'Beef Tacos', 9.99, 'None', 'Tacos with seasoned beef and toppings', '/uploads/1720006093754-809741154.png', 1),
(6, 'Vegan Burger', 11.99, 'None', 'Burger with vegan patty and toppings', '/uploads/1720005829413-185897335.png', 1),
(7, 'Grilled Salmon', 17.99, 'None', 'Grilled salmon with lemon and herbs', '/uploads/1720006071010-969987234.png', 1),
(8, 'Chocolate Cake', 6.99, 'Dairy, Gluten', 'Rich chocolate cake', '/uploads/1720006082226-46047375.png', 1),
(9, 'French Fries', 3.99, 'None', 'Crispy French fries', '/uploads/1720006063634-91786080.png', 1),
(10, 'Mushroom Risotto', 13.99, 'Dairy', 'Creamy risotto with mushrooms', '/uploads/1720006058425-268718533.png', 1),
(84, 'baraa', 12.00, 'None', 'Grilled salmon with lemon and herbs', '/uploads/f357c200915e4045316edefc11a81432-baraa.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `extras`
--

CREATE TABLE `extras` (
  `ID` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(10) DEFAULT NULL CHECK (`unit` in ('KG','G','ML','L','piece')),
  `price` decimal(10,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `extras`
--

INSERT INTO `extras` (`ID`, `name`, `quantity`, `unit`, `price`, `is_active`) VALUES
(1, 'Tomato', 100.00, 'G', 0.50, 1),
(2, 'Mozzarella', 200.00, 'G', 2.00, 1),
(3, 'Lettuce', 300.00, 'G', 1.00, 1),
(4, 'Chicken', 16.00, 'G', 3.50, 1),
(5, 'Beef', 250.00, 'G', 5.00, 1),
(6, 'Vegan Patty', 1.00, 'piece', 1.50, 1),
(7, 'Salmon', 200.00, 'G', 10.00, 1),
(8, 'Chocolate', 100.00, 'G', 2.50, 1),
(9, 'Potato', 500.00, 'G', 1.00, 1),
(10, 'Rice', 400.00, 'G', 2.00, 1),
(11, 'baraa', 16.00, 'G', 4.03, 1);

-- --------------------------------------------------------

--
-- Table structure for table `extras_dishes`
--

CREATE TABLE `extras_dishes` (
  `dish_id` int(11) NOT NULL,
  `extra_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `extras_dishes`
--

INSERT INTO `extras_dishes` (`dish_id`, `extra_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- --------------------------------------------------------

--
-- Table structure for table `ingrediants_dishes`
--

CREATE TABLE `ingrediants_dishes` (
  `dish_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ingrediants_dishes`
--

INSERT INTO `ingrediants_dishes` (`dish_id`, `ingredient_id`) VALUES
(1, 2),
(2, 1),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `ID` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `units` varchar(10) DEFAULT NULL CHECK (`unit` in ('KG','gram','ML','L','piece')),
  `quantities` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`ID`, `name`, `units`, `quantities`, `is_active`) VALUES
(1, 'Tomato', 'gram', 100.00, 1),
(2, 'Mozzarella', 'gram', 200.00, 1),
(3, 'Lettuce', 'gram', 300.00, 1),
(4, 'Chicken', 'gram', 150.00, 1),
(5, 'Beef', 'gram', 250.00, 1),
(6, 'Vegan Patty', 'piece', 1.00, 1),
(7, 'Salmon', 'gram', 200.00, 1),
(8, 'Chocolate', 'gram', 100.00, 1),
(9, 'Potato', 'gram', 500.00, 1),
(10, 'Rice', 'gram', 400.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `ID` int(11) NOT NULL,
  `order_status` varchar(100) DEFAULT NULL,
  `discounts` decimal(10,2) NOT NULL DEFAULT 0.00,
  `detailed_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `payment_status` varchar(100) DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`ID`, `order_status`, `discounts`, `detailed_price`, `date`, `payment_status`, `shipping_address`) VALUES
(1, 'Completed', 0.00, 32.97, '2023-01-01', 'Paid', '123 Main St'),
(2, 'Pending', 10.00, 26.97, '2023-01-02', 'Unpaid', '456 Elm St'),
(3, 'Shipped', 5.00, 28.97, '2023-01-03', 'Paid', '789 Oak St'),
(4, 'Cancelled', 0.00, 0.00, '2023-01-04', 'Refunded', '321 Pine St'),
(5, 'Completed', 15.00, 40.97, '2023-01-05', 'Paid', '654 Maple St'),
(6, 'Pending', 0.00, 16.99, '2023-01-06', 'Unpaid', '987 Birch St'),
(7, 'Shipped', 10.00, 53.97, '2023-01-07', 'Paid', '543 Cedar St'),
(8, 'Completed', 0.00, 25.98, '2023-01-08', 'Paid', '876 Spruce St'),
(9, 'Pending', 5.00, 21.98, '2023-01-09', 'Unpaid', '135 Walnut St'),
(10, 'Shipped', 0.00, 34.97, '2023-01-10', 'Paid', '246 Chestnut St');

-- --------------------------------------------------------

--
-- Table structure for table `order_dishes`
--

CREATE TABLE `order_dishes` (
  `order_id` int(11) NOT NULL,
  `dish_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_dishes`
--

INSERT INTO `order_dishes` (`order_id`, `dish_id`, `quantity`) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 1),
(2, 4, 1),
(2, 5, 1),
(3, 6, 1),
(3, 7, 1),
(4, 8, 1),
(5, 9, 1),
(5, 10, 1),
(6, 1, 1),
(7, 2, 1),
(7, 3, 1),
(8, 4, 1),
(8, 5, 1),
(9, 6, 1),
(9, 7, 1),
(10, 8, 1),
(10, 9, 1);

-- --------------------------------------------------------

--
-- Table structure for table `people`
--

CREATE TABLE `people` (
  `email` varchar(255) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `street_name` varchar(30) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `people`
--

INSERT INTO `people` (`email`, `role`, `city`, `street_name`, `last_name`, `first_name`, `phone_number`, `password`, `is_active`) VALUES
('alice.jones@example.com', 'Customer', 'Chicago', '789', 'Jones', 'Alice', '555-9012', 'password3', 1),
('baraa.jones@example.com', 'Customer', 'אבו סנאן', 'אלחרוב ש חייל הישנה', 'baraa', 'asfsaf', '123654789', '', 1),
('bob.brown@example.com', 'Customer', 'Houston', '321', 'Brown', 'Bob', '555-3456', 'password4', 1),
('carol.davis@example.com', 'Customer', 'Phoenix', '654', 'Davis', 'Carol', '555-7890', 'password5', 1),
('david.wilson@example.com', 'Admin', 'Philadelphia', '987', 'Wilson', 'David', '555-1234', 'password6', 1),
('deededed@outlook.com', 'Customer', '', '', '', 'gvgh', '0542908848', 'Qwe123123', 1),
('eve.white@example.com', 'Customer', 'San Antonio', '543', 'White', 'Eve', '555-5678', 'password7', 1),
('frank.thomas@example.com', 'Customer', 'San Diego', '876', 'Thomas', 'Frank', '555-9012', 'password8', 1),
('george54@gmail.com', NULL, 'אבו סנאן', 'קריית החינוך', NULL, NULL, '123654789', NULL, 1),
('georgearmaly54@outlook.com', 'Admin', 'אבו סנאן', 'מרכז הכפר', 'armaly', 'george', '0542908848', '', 1),
('grace.moore@example.com', 'Customer', 'Dallas', '135', 'Moore', 'Grace', '555-3456', 'password9', 1),
('henry.taylor@example.com', 'Customer', 'San Jose', '246', 'Taylor', 'Henry', '555-7890', 'password10', 1),
('jane.smith@example.com', 'Customer', 'Los Angeles', '456', 'Smith', 'Jane', '555-5678', 'password2', 1),
('john.doe@example.com', 'Customer', 'New York', '123', 'Doe', 'John', '555-1234', 'password1', 1),
('wadawdaw@dd.com', 'Customer', 'אבו סריחאן (שבט)', 'אבו סריחאן (שבט)', 'aa', 'hh', '0542908848', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `people_orders`
--

CREATE TABLE `people_orders` (
  `email` varchar(255) NOT NULL,
  `order_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `people_orders`
--

INSERT INTO `people_orders` (`email`, `order_id`) VALUES
('alice.jones@example.com', 3),
('bob.brown@example.com', 4),
('carol.davis@example.com', 5),
('david.wilson@example.com', 6),
('eve.white@example.com', 7),
('frank.thomas@example.com', 8),
('grace.moore@example.com', 9),
('henry.taylor@example.com', 10),
('jane.smith@example.com', 2),
('john.doe@example.com', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dishes`
--
ALTER TABLE `dishes`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `extras`
--
ALTER TABLE `extras`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `extras_dishes`
--
ALTER TABLE `extras_dishes`
  ADD PRIMARY KEY (`dish_id`,`extra_id`),
  ADD KEY `extra_id` (`extra_id`);

--
-- Indexes for table `ingrediants_dishes`
--
ALTER TABLE `ingrediants_dishes`
  ADD PRIMARY KEY (`dish_id`,`ingredient_id`),
  ADD KEY `ingredient_id` (`ingredient_id`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `order_dishes`
--
ALTER TABLE `order_dishes`
  ADD PRIMARY KEY (`order_id`,`dish_id`),
  ADD KEY `dish_id` (`dish_id`);

--
-- Indexes for table `people`
--
ALTER TABLE `people`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `people_orders`
--
ALTER TABLE `people_orders`
  ADD PRIMARY KEY (`email`,`order_id`),
  ADD KEY `order_id` (`order_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dishes`
--
ALTER TABLE `dishes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `extras`
--
ALTER TABLE `extras`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `extras_dishes`
--
ALTER TABLE `extras_dishes`
  ADD CONSTRAINT `extras_dishes_ibfk_1` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `extras_dishes_ibfk_2` FOREIGN KEY (`extra_id`) REFERENCES `extras` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `ingrediants_dishes`
--
ALTER TABLE `ingrediants_dishes`
  ADD CONSTRAINT `ingrediants_dishes_ibfk_1` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ingrediants_dishes_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `order_dishes`
--
ALTER TABLE `order_dishes`
  ADD CONSTRAINT `order_dishes_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`ID`),
  ADD CONSTRAINT `order_dishes_ibfk_2` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`ID`);

--
-- Constraints for table `people_orders`
--
ALTER TABLE `people_orders`
  ADD CONSTRAINT `people_orders_ibfk_1` FOREIGN KEY (`email`) REFERENCES `people` (`email`),
  ADD CONSTRAINT `people_orders_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
