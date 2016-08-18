-- CREATE TABLE image
-- (
--   id    INT UNSIGNED NOT NULL AUTO_INCREMENT, # image ID number
--   name  VARCHAR(30) NOT NULL,                 # image name
--   type  VARCHAR(20) NOT NULL,                 # image MIME type
--   data  LONGBLOB NOT NULL,                    # image data
--   PRIMARY KEY (id),                           # id and name are unique
--   UNIQUE (name)
-- );

CREATE TABLE IF NOT EXISTS stock_daily_info ( 
    id INT NOT NULL,
    date Date NOT NULL, 
    vol BIGINT, 
    turnover BIGINT, 
    open Float, 
    high Float, 
    low Float, 
    close Float, 
    diff Float, 
    transactions INT,
    pb_ratio Float,
    pe_ratio Float,
    yield Float,
    PRIMARY KEY (id, date) 
);

CREATE TABLE IF NOT EXISTS stock (
    id INT NOT NULL,
    name VARCHAR(30),
    PRIMARY KEY (id)
);