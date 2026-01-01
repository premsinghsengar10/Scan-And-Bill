package com.example.scanbill.service;

import com.example.scanbill.model.Cart;
import com.example.scanbill.model.CartItem;
import com.example.scanbill.model.InventoryItem;
import com.example.scanbill.model.Order;
import com.example.scanbill.repository.CartRepository;
import com.example.scanbill.repository.InventoryItemRepository;
import com.example.scanbill.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    public void testCheckoutSuccess() {
        String userId = "user1";
        String storeId = "store1";
        String idempotencyKey = "key-123";

        // Mock Cart
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setStoreId(storeId);
        cart.setItems(new ArrayList<>());
        cart.getItems().add(new CartItem("prod1", "Item 1", 100.0, 1, "S123"));
        cart.setTotalAmount(100.0);

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        // Mock Inventory Item
        InventoryItem item = new InventoryItem("i1", "B123", "S123", "AVAILABLE", storeId, 1L);
        when(inventoryItemRepository.findBySerialNumber("S123")).thenReturn(Optional.of(item));

        // Mock Order Save
        Order savedOrder = new Order();
        savedOrder.setId("order1");
        savedOrder.setStatus("PAID");
        savedOrder.setIdempotencyKey(idempotencyKey);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        // Execute
        Order result = orderService.checkout(userId, "John", "999", storeId, idempotencyKey);

        // Verify
        assertEquals("PAID", result.getStatus());
        assertEquals(idempotencyKey, result.getIdempotencyKey());
        verify(inventoryItemRepository, times(1)).saveAll(any());
        verify(cartRepository, times(1)).save(cart); // Should clear cart
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    public void testCheckoutIdempotency() {
        String idempotencyKey = "duplicate-key";
        Order existingOrder = new Order();
        existingOrder.setId("order-existing");
        existingOrder.setIdempotencyKey(idempotencyKey);

        // Mock finding existing order
        when(orderRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.of(existingOrder));

        // Execute
        Order result = orderService.checkout("user1", "John", "999", "store1", idempotencyKey);

        // Verify it returned existing order mock verify
        assertEquals("order-existing", result.getId());

        // Verify we NEVER touched the cart or inventory
        verify(cartRepository, never()).findByUserId(anyString());
        verify(inventoryItemRepository, never()).saveAll(any());
    }

    @Test
    public void testCheckoutEmptyCart() {
        String userId = "user1";
        Cart cart = new Cart();
        cart.setItems(new ArrayList<>()); // Empty

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        assertThrows(RuntimeException.class, () -> {
            orderService.checkout(userId, "John", "999", "store1", "key1");
        });
    }

    @Test
    public void testCheckoutItemSold() {
        String userId = "user1";
        Cart cart = new Cart();
        cart.setItems(new ArrayList<>());
        cart.getItems().add(new CartItem("p1", "Item Sold", 50.0, 1, "S-SOLD"));

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        InventoryItem item = new InventoryItem("i1", "B1", "S-SOLD", "SOLD", "store1", 1L);
        when(inventoryItemRepository.findBySerialNumber("S-SOLD")).thenReturn(Optional.of(item));

        assertThrows(RuntimeException.class, () -> {
            orderService.checkout(userId, "John", "999", "store1", "key1");
        });
    }
}
