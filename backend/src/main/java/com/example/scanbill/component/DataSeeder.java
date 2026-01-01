package com.example.scanbill.component;

import com.example.scanbill.model.*;
import com.example.scanbill.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
        private final ProductRepository productRepository;
        private final InventoryItemRepository inventoryItemRepository;
        private final StoreRepository storeRepository;
        private final UserRepository userRepository;
        private final CartRepository cartRepository;
        private final OrderRepository orderRepository;

        @Override
        public void run(String... args) throws Exception {
                // Wipe all existing data for a clean multi-store demo environment
                System.out.println("Wiping existing data for fresh multi-store ecosystem...");
                productRepository.deleteAll();
                inventoryItemRepository.deleteAll();
                storeRepository.deleteAll();
                userRepository.deleteAll();
                cartRepository.deleteAll();
                orderRepository.deleteAll();

                System.out.println("Provisioning Multi-Store Ecosystem...");

                // 1. Super Admin
                userRepository.save(new User(null, "super", "super123", Role.SUPER_ADMIN, null, null));

                // 2. Stores & Admins
                String[][] storeConfigs = {
                                { "Alpha Digital", "Metropolis Hub", "admin1", "pass123" },
                                { "Beta Boutique", "Neo Tokyo", "admin2", "pass123" },
                                { "Gamma Grocery", "Cyber City", "admin3", "pass123" }
                };

                for (int s = 0; s < storeConfigs.length; s++) {
                        String[] config = storeConfigs[s];
                        Store store = storeRepository.save(new Store(null, config[0], config[1], null));
                        userRepository.save(new User(null, config[2], config[3], Role.ADMIN, store.getId(), null));

                        // 3. 25 Products per store
                        String prefix = (s == 0 ? "A" : (s == 1 ? "B" : "G"));
                        List<Product> products = new ArrayList<>();
                        for (int i = 1; i <= 25; i++) {
                                String category = getCategory(i);
                                String barcode = prefix + String.format("%03d", i);
                                products.add(new Product(null, barcode, config[0] + " Premium Item " + i,
                                                20.0 + (i * 10), category, getImageUrl(category), 10.0 + (i * 5),
                                                store.getId(), 18.0, 10.0 + (i * 5), null));
                        }
                        productRepository.saveAll(products);

                        // 4. 10 Units (Stock) per product
                        List<InventoryItem> items = new ArrayList<>();
                        for (Product p : products) {
                                for (int u = 1; u <= 10; u++) {
                                        String serial = p.getBarcode() + "-" + String.format("%03d", u);
                                        items.add(new InventoryItem(null, p.getBarcode(), serial, "AVAILABLE",
                                                        store.getId(), null));
                                }
                        }
                        inventoryItemRepository.saveAll(items);
                }

                System.out.println("Ecosystem Provisioning Complete!");
                System.out.println("Super Admin: super / super123");
                System.out.println("Store 1: Alpha Digital (admin1 / pass123)");
                System.out.println("Store 2: Beta Boutique (admin2 / pass123)");
                System.out.println("Store 3: Gamma Grocery (admin3 / pass123)");
        }

        private String getCategory(int i) {
                if (i <= 5)
                        return "Electronics";
                if (i <= 10)
                        return "Apparel";
                if (i <= 15)
                        return "Home";
                if (i <= 20)
                        return "Stationery";
                return "Accessories";
        }

        private String getImageUrl(String cat) {
                switch (cat) {
                        case "Electronics":
                                return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400";
                        case "Apparel":
                                return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400";
                        case "Home":
                                return "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=400";
                        case "Stationery":
                                return "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400";
                        default:
                                return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
                }
        }
}
