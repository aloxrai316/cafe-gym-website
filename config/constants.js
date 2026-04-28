module.exports = {
  RESERVATION_ADVANCE: 500,
  PRE_ORDER_ADVANCE_PERCENT: 50,
  AUTO_CANCEL_MINUTES: 30,
  TAX_RATE: 0.13,
  MEMBERSHIP_FEES: {
    basic: 2000,
    cardio: 3000,
    premium: 5000
  },
  CARDIO_ADDON_FEE: 1000,
  MEMBERSHIP_EXPIRY_ALERT_DAYS: 7,
  ORDER_STATUSES: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
  PAYMENT_METHODS: ['cash', 'card', 'esewa', 'khalti', 'online'],
  ROLES: ['customer', 'admin', 'kitchen_staff', 'gym_trainer']
};
