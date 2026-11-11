-- Orders placed through the website checkout.
-- Run with: npm run db:setup  (creates the database too if it does not exist)

CREATE TABLE IF NOT EXISTS orders (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(100) NOT NULL,
  phone         CHAR(10)     NOT NULL,
  method        ENUM('pickup', 'delivery', 'install') NOT NULL,
  address       VARCHAR(500) NULL,
  note          VARCHAR(500) NULL,
  -- Rupees. Prices are copied from the catalog when the order is placed.
  subtotal      INT UNSIGNED NOT NULL,
  status        ENUM('new', 'confirmed', 'delivered', 'cancelled') NOT NULL DEFAULT 'new',
  -- Stored in UTC; the admin page shows India time.
  created_at    DATETIME     NOT NULL,
  updated_at    DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_orders_status_created (status, created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id     INT UNSIGNED NOT NULL,
  product_slug VARCHAR(120) NOT NULL,
  -- Name and price are snapshots, so later catalog edits do not change old orders.
  product_name VARCHAR(200) NOT NULL,
  unit_price   INT UNSIGNED NOT NULL,
  qty          SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Products shown in the store, managed from /admin/products.
CREATE TABLE IF NOT EXISTS products (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug            VARCHAR(120) NOT NULL,
  name            VARCHAR(200) NOT NULL,
  brand           VARCHAR(80)  NOT NULL,
  category        VARCHAR(30)  NOT NULL,
  -- Rupees. mrp is the optional "was" price shown struck through.
  price           INT UNSIGNED NOT NULL,
  mrp             INT UNSIGNED NULL,
  summary         VARCHAR(500) NOT NULL DEFAULT '',
  -- Image URLs in display order, e.g. ["/catalog/x.jpg", "/media/y.webp"].
  images          JSON NOT NULL,
  highlights      JSON NOT NULL,
  -- [["Resolution", "5MP"], ...]
  specs           JSON NOT NULL,
  video           VARCHAR(120) NULL,
  camera_type     ENUM('Bullet', 'Dome') NULL,
  connection_type ENUM('IP', 'HD') NULL,
  featured        TINYINT(1) NOT NULL DEFAULT 0,
  in_stock        TINYINT(1) NOT NULL DEFAULT 1,
  -- Hidden products stay in admin but disappear from the store.
  listed          TINYINT(1) NOT NULL DEFAULT 1,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_listed_sort (listed, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
