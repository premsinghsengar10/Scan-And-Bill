package com.example.scanbill.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String barcode;
    private String name;
    private double price;
    private String category;
    private String imageUrl;
    private double basePrice;
    private String storeId;

    // Admin Fields
    private double taxRate; // Percentage (e.g., 18.0)
    private double costPrice; // For profit calculation

    @Version
    private Long version;
}
