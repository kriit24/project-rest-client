CREATE TABLE `table_relation` (
                                  `table_relation_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                  `table_relation_table_name` VARCHAR(255) NOT NULL COLLATE 'utf8mb3_general_ci',
                                  `table_relation_table_id` BIGINT(20) NOT NULL,
                                  `table_relation_unique_id` VARCHAR(255) NOT NULL COLLATE 'utf8mb3_general_ci',
                                  `table_relation_created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
                                  PRIMARY KEY (`table_relation_id`) USING BTREE,
                                  INDEX `table_relation_unique_id` (`table_relation_unique_id`) USING BTREE
)
    COLLATE='utf8mb3_general_ci'
ENGINE=InnoDB

;
