package com.example.scanbill.service;

import com.example.scanbill.model.Cart;
import com.example.scanbill.model.CartItem;
import com.example.scanbill.model.InventoryItem;
import com.example.scanbill.model.Order;
import com.example.scanbill.repository.CartRepository;
import com.example.scanbill.repository.InventoryItemRepository;
import com.example.scanbill.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public Order checkout(String userId, String customerName, String customerMobile, String storeId,
            String idempotencyKey) {
        // 1. Check if order with this idempotencyKey already exists
        if (idempotencyKey != null && !idempotencyKey.isEmpty()) {
            java.util.Optional<Order> existingOrder = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existingOrder.isPresent()) {
                return existingOrder.get();
            }
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 2. Mark items as SOLD (Atomic check)
        List<InventoryItem> itemsToUpdate = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            InventoryItem invItem = inventoryItemRepository.findBySerialNumber(item.getSerialNumber())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + item.getSerialNumber()));

            if (!"AVAILABLE".equals(invItem.getStatus())) {
                throw new RuntimeException("One or more items already sold. Please refresh cart.");
            }
            invItem.setStatus("SOLD");
            itemsToUpdate.add(invItem);
        }

        // Save all inventory updates first
        inventoryItemRepository.saveAll(itemsToUpdate);

        // 3. Create Order
        Order order = new Order();
        order.setUserId(userId);
        order.setItems(new ArrayList<>(cart.getItems()));
        order.setTotalAmount(cart.getTotalAmount());
        order.setStatus("PAID");
        order.setTimestamp(LocalDateTime.now());
        order.setCustomerName(customerName);
        order.setCustomerMobile(customerMobile);
        order.setStoreId(storeId);
        order.setIdempotencyKey(idempotencyKey);

        Order savedOrder = orderRepository.save(order);

        // 4. Clear cart
        cart.getItems().clear();
        cart.setTotalAmount(0);
        cartRepository.save(cart);

        return savedOrder;
    }

    public List<Order> getOrdersByStoreId(String storeId) {
        return orderRepository.findByStoreId(storeId);
    }
}
