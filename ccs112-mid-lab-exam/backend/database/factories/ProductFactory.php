<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $categories = [
        'Electronics' => ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'TV', 'Camera', 'Speaker', 'Monitor'],
        'Clothing' => ['T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sweater', 'Shorts', 'Shoes', 'Coat'],
        'Home' => ['Chair', 'Table', 'Lamp', 'Sofa', 'Bed', 'Desk', 'Bookshelf', 'Mirror'],
        'Kitchen' => ['Blender', 'Toaster', 'Microwave', 'Knife Set', 'Cookware', 'Coffee Maker', 'Air Fryer'],
        'Sports' => ['Running Shoes', 'Yoga Mat', 'Dumbbells', 'Basketball', 'Tennis Racket', 'Bicycle', 'Fitness Tracker'],
        'Beauty' => ['Shampoo', 'Face Cream', 'Perfume', 'Lipstick', 'Foundation', 'Moisturizer', 'Eye Shadow'],
        'Books' => ['Novel', 'Textbook', 'Cookbook', 'Biography', 'Fantasy', 'Mystery', 'Self-Help'],
    ];

    protected $specificProducts = [
        'Electronics' => [
            ['Samsung Galaxy S25', 1199.99, 'Flagship smartphone with 6.8" AMOLED display and 108MP camera.'],
            ['Apple MacBook Air', 1099.99, 'Ultra-thin laptop with M3 chip and 18-hour battery life.'],
            ['Sony WH-1000XM5', 349.99, 'Premium noise-cancelling headphones with 30-hour battery life.'],
            ['LG OLED C3 TV', 1699.99, '65" 4K Smart TV with perfect blacks and Dolby Vision.'],
            ['Bose QuietComfort 45', 329.99, 'Wireless noise-cancelling headphones with comfortable fit.'],
            ['Canon EOS R8', 1499.99, 'Full-frame mirrorless camera with 24.2MP sensor.'],
            ['Amazon Echo Dot', 49.99, 'Smart speaker with Alexa voice assistant.'],
            ['Dell XPS 15', 1799.99, 'Premium laptop with 15" 4K touch display and Intel i9 processor.']
        ],
        'Clothing' => [
            ['Nike Dri-FIT Tee', 35.99, 'Moisture-wicking t-shirt for workouts and casual wear.'],
            ['Levi\'s 501 Jeans', 79.99, 'Classic straight-leg jeans with button fly.'],
            ['Adidas Ultraboost', 189.99, 'Responsive running shoes with Boost midsole.'],
            ['H&M Wool Sweater', 49.99, 'Soft wool-blend sweater for colder seasons.'],
            ['Zara Leather Jacket', 189.99, 'Classic biker jacket in genuine leather.'],
            ['Uniqlo HEATTECH Top', 19.99, 'Heat-retaining base layer for cold weather.'],
            ['Under Armour Shorts', 29.99, 'Lightweight training shorts with built-in liner.'],
            ['North Face Parka', 299.99, 'Insulated winter coat with waterproof exterior.']
        ],
        'Home' => [
            ['IKEA MALM Bed', 279.99, 'Queen-size bed frame with clean lines and timeless design.'],
            ['West Elm Sofa', 1299.99, 'Modern sectional with performance fabric upholstery.'],
            ['Wayfair Dining Table', 499.99, 'Solid wood table that seats 6 people comfortably.'],
            ['Pottery Barn Lamp', 159.99, 'Adjustable desk lamp with brushed brass finish.'],
            ['Crate & Barrel Chair', 699.99, 'Mid-century inspired lounge chair in premium leather.'],
            ['Target Standing Desk', 249.99, 'Height-adjustable desk with dual-motor lift system.'],
            ['Home Depot Ceiling Fan', 149.99, 'Modern ceiling fan with integrated LED light.'],
            ['Ashley Nightstand', 129.99, 'Two-drawer nightstand with USB charging ports.']
        ],
        'Kitchen' => [
            ['KitchenAid Mixer', 399.99, 'Stand mixer with 10 speeds and 5-quart stainless steel bowl.'],
            ['Ninja Blender', 99.99, 'High-powered blender for smoothies and food processing.'],
            ['Instant Pot Duo', 119.99, '7-in-1 programmable pressure cooker and slow cooker.'],
            ['Cuisinart Toaster', 79.99, '4-slice toaster with custom heat settings.'],
            ['Vitamix E310', 349.99, 'Professional-grade blender with variable speed control.'],
            ['Breville Espresso', 699.99, 'Semi-automatic espresso machine with built-in grinder.'],
            ['Calphalon Cookware', 299.99, '10-piece nonstick cookware set with tempered glass lids.'],
            ['Wüsthof Knife Set', 349.99, '7-piece premium knife set with hardwood block.']
        ],
        'Sports' => [
            ['Peloton Bike', 1445.99, 'Stationary exercise bike with 22" HD touchscreen.'],
            ['Nike React Shoes', 129.99, 'Lightweight running shoes with responsive cushioning.'],
            ['Manduka Yoga Mat', 89.99, 'High-performance non-slip yoga mat with lifetime guarantee.'],
            ['Bowflex Dumbbells', 399.99, 'Adjustable dumbbells replacing 15 sets of weights.'],
            ['Wilson Evolution', 59.99, 'Official size basketball with composite leather cover.'],
            ['Garmin Forerunner', 299.99, 'GPS running watch with advanced training metrics.'],
            ['Trek FX 2 Bicycle', 649.99, 'Versatile hybrid bike for commuting and fitness.'],
            ['TaylorMade Driver', 549.99, 'Premium golf driver with adjustable weighting system.']
        ],
        'Beauty' => [
            ['Olaplex Hair Repair', 28.99, 'Bond-building treatment for damaged hair.'],
            ['Cerave Moisturizer', 18.99, 'Daily facial moisturizer with SPF 30 protection.'],
            ['Dior Sauvage', 109.99, 'Woody aromatic fragrance for men.'],
            ['MAC Lipstick', 19.99, 'Creamy matte lipstick in Ruby Woo shade.'],
            ['Fenty Foundation', 38.99, 'Longwear liquid foundation in 50+ shades.'],
            ['Drunk Elephant Serum', 78.99, 'Vitamin C serum for brighter and firmer skin.'],
            ['Urban Decay Palette', 54.99, 'Naked eyeshadow palette with 12 neutral shades.'],
            ['Dyson Hair Dryer', 429.99, 'Digital motor hair dryer with ionic technology.']
        ],
        'Books' => [
            ['Atomic Habits', 24.99, 'Guide to building good habits and breaking bad ones by James Clear.'],
            ['Calculus Textbook', 149.99, 'Comprehensive guide to calculus principles for college students.'],
            ['Salt Fat Acid Heat', 35.99, 'Cooking guide focusing on four elements that make food delicious.'],
            ['Steve Jobs Biography', 29.99, 'Authorized biography of Apple\'s founder by Walter Isaacson.'],
            ['The Way of Kings', 18.99, 'Epic fantasy novel by Brandon Sanderson, first in the Stormlight Archive.'],
            ['The Silent Patient', 16.99, 'Psychological thriller about a woman who stops speaking after murdering her husband.'],
            ['Think Again', 27.99, 'Book about learning to question your opinions and open others\' minds by Adam Grant.'],
            ['Project Hail Mary', 17.99, 'Science fiction novel about a lone astronaut who must save humanity by Andy Weir.']
        ],
    ];

    public function definition(): array
    {
        static $lastCreatedAt = null;
    
        if ($lastCreatedAt === null) {
            $lastCreatedAt = now()->subYears(2);
        }
    
        $createdAt = $lastCreatedAt;
        $lastCreatedAt = $createdAt->addHours(rand(1, 24)); 
    
        $category = $this->faker->randomElement(array_keys($this->categories));
        
        if ($this->faker->boolean(70) && isset($this->specificProducts[$category])) {
            $productData = $this->faker->randomElement($this->specificProducts[$category]);
            $name = $productData[0];
            $price = $productData[1];
            $baseDescription = $productData[2];
            
            $extraSentences = [
                "Available in multiple colors.",
                "Includes free shipping.",
                "Limited stock available.",
                "Best seller in its category.",
                "Exclusively available online.",
                "Backed by our 1-year warranty.",
                "Perfect gift idea.",
            ];
            
            $description = $baseDescription . ' ' . $this->faker->randomElement($extraSentences);
            $productType = explode(' ', $name)[count(explode(' ', $name)) - 1]; 
        } else {
            $productType = $this->faker->randomElement($this->categories[$category]);
            $name = $this->generateProductName($category, $productType);
            $description = $this->generateDescription($category, $productType);
            $price = $this->generatePrice($category, $productType);
        }
        
        $stock = $this->generateStock($category, $productType);
    
        return [
            'name' => $name,
            'description' => $description,
            'price' => isset($price) ? $price : $this->generatePrice($category, $productType),
            'stock' => $stock,
            'image' => null,
            'created_at' => $createdAt,
            'updated_at' => $createdAt->addMinutes(rand(1, 60)), 
        ];
    }
    
    protected function generateProductName($category, $productType): string
    {
        $brands = [
            'Electronics' => ['Samsung', 'Apple', 'Sony', 'LG', 'Bose', 'Canon', 'Dell', 'HP'],
            'Clothing' => ['Nike', 'Adidas', 'Levi\'s', 'Zara', 'H&M', 'Uniqlo', 'Puma', 'Gap'],
            'Home' => ['IKEA', 'Ashley', 'West Elm', 'Pottery Barn', 'Wayfair', 'CB2'],
            'Kitchen' => ['KitchenAid', 'Cuisinart', 'Ninja', 'Instant Pot', 'Breville', 'Vitamix'],
            'Sports' => ['Nike', 'Adidas', 'Under Armour', 'Wilson', 'Garmin', 'Yeti'],
            'Beauty' => ['L\'Oreal', 'Olay', 'Neutrogena', 'MAC', 'Fenty', 'Cerave'],
            'Books' => ['Penguin', 'HarperCollins', 'Simon & Schuster', 'Random House', 'Macmillan'],
        ];

        $brand = $this->faker->randomElement($brands[$category] ?? ['Generic']);
        
        $model = $this->faker->boolean(30) 
            ? ' ' . strtoupper($this->faker->lexify('??')) . $this->faker->numberBetween(1, 99) 
            : '';
            
        return "{$brand} {$productType}{$model}";
    }

    protected function generateDescription($category, $productType): string
    {
        $descriptions = [
            'Electronics' => [
                "High-performance {$productType} with advanced features and sleek design.",
                "Next-generation {$productType} with improved battery life and faster processing.",
                "Premium {$productType} designed for both professionals and enthusiasts."
            ],
            'Clothing' => [
                "Comfortable {$productType} made from soft, breathable fabric.",
                "Stylish {$productType} that combines fashion with everyday comfort.",
                "Durable {$productType} perfect for any season."
            ],
            'Home' => [
                "Well-crafted {$productType} that adds elegance to any room.",
                "Sturdy {$productType} built with quality materials for long-lasting use.",
                "Modern {$productType} that balances style and functionality."
            ],
            'Kitchen' => [
                "Reliable {$productType} that makes cooking easier and more enjoyable.",
                "High-quality {$productType} designed for everyday kitchen use.",
                "Versatile {$productType} that helps you prepare delicious meals effortlessly."
            ],
            'Sports' => [
                "Performance-focused {$productType} for serious athletes.",
                "Comfortable {$productType} designed for maximum durability during workouts.",
                "Professional-grade {$productType} that enhances your training experience."
            ],
            'Beauty' => [
                "Gentle yet effective {$productType} for your daily routine.",
                "Premium {$productType} made with high-quality ingredients.",
                "Dermatologist-recommended {$productType} for all skin types."
            ],
            'Books' => [
                "Engaging {$productType} that will keep you turning pages.",
                "Informative {$productType} written by industry experts.",
                "Bestselling {$productType} with excellent reader reviews."
            ],
        ];

        $base = $descriptions[$category] ?? [
            "Quality {$productType} that delivers excellent value.",
            "Reliable {$productType} for everyday use.",
            "Well-designed {$productType} that meets your needs."
        ];

        $extras = [
            "Available in multiple colors.",
            "Free shipping included.",
            "While supplies last.",
            "Satisfaction guaranteed.",
            "Exclusive online offer.",
            "Limited time discount.",
            "Comes with 1-year warranty."
        ];

        return $this->faker->randomElement($base) . ' ' . 
               $this->faker->randomElement($extras);
    }

    protected function generatePrice($category, $productType): float
    {
        $priceRanges = [
            'Electronics' => [99.99, 1999.99],
            'Clothing' => [19.99, 199.99],
            'Home' => [49.99, 1499.99],
            'Kitchen' => [29.99, 399.99],
            'Sports' => [39.99, 599.99],
            'Beauty' => [9.99, 149.99],
            'Books' => [9.99, 39.99],
        ];

        $range = $priceRanges[$category] ?? [9.99, 199.99];
        
        $price = $this->faker->randomFloat(2, $range[0], $range[1]);
        return floor($price) + 0.99;
    }

    protected function generateStock($category, $productType): int
    {
        $isPopular = $this->faker->boolean(30);
        
        if ($isPopular) {
            return $this->faker->numberBetween(3, 25);
        }
        
        $stockRanges = [
            'Electronics' => [10, 80],
            'Clothing' => [20, 150],
            'Home' => [5, 40],
            'Kitchen' => [15, 60],
            'Sports' => [10, 50],
            'Beauty' => [20, 100],
            'Books' => [25, 150],
        ];

        $range = $stockRanges[$category] ?? [5, 100];
        return $this->faker->numberBetween($range[0], $range[1]);
    }
}