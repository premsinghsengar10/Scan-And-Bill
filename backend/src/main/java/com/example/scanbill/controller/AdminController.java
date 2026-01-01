package com.example.scanbill.controller;

import com.example.scanbill.model.Order;
import com.example.scanbill.model.Product;
import com.example.scanbill.service.OrderService;
import com.example.scanbill.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;

    @PostMapping("/products")
    public Product createProduct(@RequestBody Product product, @RequestParam int initialStock) {
        return productService.addProductWithStock(product, initialStock);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable String id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
    }

    @PostMapping("/inventory/add")
    public void addInventory(@RequestParam String barcode, @RequestParam int quantity, @RequestParam String storeId) {
        productService.addStock(barcode, quantity, storeId);
    }

    @GetMapping("/orders")
    public List<Order> getOrders(@RequestParam String storeId) {
        return orderService.getOrdersByStoreId(storeId);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats(@RequestParam String storeId) {
        List<Order> orders = orderService.getOrdersByStoreId(storeId);
        double totalRevenue = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        long totalOrders = orders.size();
        return Map.of("totalRevenue", totalRevenue, "totalOrders", totalOrders);
    }
}
