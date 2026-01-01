package com.example.scanbill.service;

import com.example.scanbill.model.Product;
import com.example.scanbill.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    private final com.example.scanbill.repository.InventoryItemRepository inventoryItemRepository;

    public Optional<Product> getProductByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByStoreId(String storeId) {
        return productRepository.findByStoreId(storeId);
    }

    public Product addProductWithStock(Product product, int initialStock) {
        Product savedProduct = productRepository.save(product);

        // Generate initial inventory items (units)
        List<com.example.scanbill.model.InventoryItem> items = new java.util.ArrayList<>();
        for (int i = 1; i <= initialStock; i++) {
            String serial = savedProduct.getBarcode() + "-" + String.format("%03d", i);
            items.add(new com.example.scanbill.model.InventoryItem(null, savedProduct.getBarcode(), serial, "AVAILABLE",
                    savedProduct.getStoreId(), null));
        }
        inventoryItemRepository.saveAll(items);

        return savedProduct;
    }

    public Product updateProduct(String id, Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setPrice(productDetails.getPrice());
            product.setCategory(productDetails.getCategory());
            product.setBasePrice(productDetails.getBasePrice());
            product.setTaxRate(productDetails.getTaxRate());
            product.setCostPrice(productDetails.getCostPrice());
            product.setImageUrl(productDetails.getImageUrl());
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public void addStock(String barcode, int quantity, String storeId) {
        List<com.example.scanbill.model.InventoryItem> items = new java.util.ArrayList<>();
        // Find existing max serial to append correctly?
        // For simplicity, just use UUID or Timestamp suffix if we don't track max
        // serial strictly?
        // Or finding count.
        // Let's us simple timestamp-based serials for additional stock to avoid
        // collisions easily.
        long timestamp = System.currentTimeMillis();

        for (int i = 1; i <= quantity; i++) {
            String serial = barcode + "-ADD-" + timestamp + "-" + i;
            items.add(new com.example.scanbill.model.InventoryItem(null, barcode, serial, "AVAILABLE",
                    storeId, null));
        }
        inventoryItemRepository.saveAll(items);
    }
}
