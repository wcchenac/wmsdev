"""Baseline: the schema Hibernate (hbm2ddl=update) generated for wmstool.

Source: contract-tests/schema/wms-hibernate-generated.sql, with CREATE TABLE
made idempotent and the MySQL-8-only collation dropped (production MySQL is
5.x per MySQL5InnoDBDialect). Column names keep Hibernate's camelCase and
table names are lower case (production MySQL runs lower_case_table_names=1).

Existing production database: run `alembic stamp 0001`, not `upgrade`.

Revision ID: 0001
Revises:
"""

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

TABLES = [
    """
CREATE TABLE IF NOT EXISTS `categorydetail` (
  `productNo` varchar(25) NOT NULL,
  `lotNo` varchar(50) NOT NULL,
  `type` varchar(10) NOT NULL,
  `quantity` varchar(10) NOT NULL,
  `unit` varchar(10) NOT NULL,
  `color` int NOT NULL,
  `defect` varchar(10) NOT NULL,
  `remark` varchar(255) NOT NULL,
  `record` varchar(255) NOT NULL,
  `inStockType` varchar(20) NOT NULL,
  `firstStockAt` varchar(30) NOT NULL,
  `category` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `childrenIdentifierId` tinyblob,
  `currentIdentifierId` bigint DEFAULT NULL,
  `rootIdentifierId` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `instockorderrecord` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `defect` varchar(255) DEFAULT NULL,
  `inStockOrderNo` varchar(255) DEFAULT NULL,
  `inStockType` varchar(255) DEFAULT NULL,
  `lotNo` varchar(255) DEFAULT NULL,
  `productNo` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `stockIdentifierId` bigint DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `outstockrequest` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `defect` varchar(255) DEFAULT NULL,
  `fileName` varchar(255) DEFAULT NULL,
  `isDeleted` bit(1) NOT NULL,
  `isHandled` bit(1) NOT NULL,
  `lotNo` varchar(255) DEFAULT NULL,
  `outStockType` int NOT NULL,
  `productNo` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `requestFrom` varchar(255) DEFAULT NULL,
  `stockIdentifierId` bigint NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cName` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `isAlert` bit(1) NOT NULL,
  `isBypass` bit(1) NOT NULL,
  `productNo` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `safeQuantity` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `whType` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `salerecords` (
  `productNo` varchar(25) NOT NULL,
  `reason` varchar(50) NOT NULL,
  `quantity` varchar(10) NOT NULL,
  `unit` varchar(10) NOT NULL,
  `category` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `stockadjustmentrecord` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `GWN` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `issuedByStockIdentifier` bigint DEFAULT NULL,
  `issuedByTransactionRecord` bigint DEFAULT NULL,
  `productNo` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `realQuantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `stockallocationrecord` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `INGWN` varchar(255) DEFAULT NULL,
  `OUTGWN` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `issuedByStockIdentifier` bigint DEFAULT NULL,
  `issuedByTransactionRecord` bigint DEFAULT NULL,
  `productNo` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `realQuantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `stockidentifier` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adjustment` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `eliminateDate` varchar(255) DEFAULT NULL,
  `eliminateReason` varchar(255) DEFAULT NULL,
  `eliminateType` varchar(255) DEFAULT NULL,
  `firstInStockAt` varchar(255) DEFAULT NULL,
  `inStockType` varchar(255) DEFAULT NULL,
  `isExist` bit(1) NOT NULL,
  `isOutStock` bit(1) NOT NULL,
  `lotNo` varchar(255) DEFAULT NULL,
  `outStockAt` datetime DEFAULT NULL,
  `productNo` varchar(25) NOT NULL,
  `quantity` varchar(10) NOT NULL,
  `serialNo` int NOT NULL,
  `type` varchar(10) NOT NULL,
  `unit` varchar(10) NOT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `waitToShrink` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `stockidentifierbacklog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lotNo` varchar(255) DEFAULT NULL,
  `productNo` varchar(25) NOT NULL,
  `quantity` varchar(10) NOT NULL,
  `serialNo` int NOT NULL,
  `type` varchar(10) NOT NULL,
  `unit` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `stockinfo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `defect` varchar(10) DEFAULT NULL,
  `record` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `shrinkAt` varchar(255) DEFAULT NULL,
  `storedAt` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `stockIdentifier_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbfhlcb4fo1yoabno2uam1s2qy` (`stockIdentifier_id`),
  CONSTRAINT `FKbfhlcb4fo1yoabno2uam1s2qy` FOREIGN KEY (`stockIdentifier_id`) REFERENCES `stockidentifier` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `transactionrecord` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `lotNo` varchar(255) DEFAULT NULL,
  `operator` varchar(255) DEFAULT NULL,
  `productNo` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `stockIdentifierId` bigint DEFAULT NULL,
  `transactionType` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(255) DEFAULT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_m5a1p557f8qjk9yoiwipnfay6` (`employeeId`),
  KEY `FK84qlpfci484r1luck11eno6ec` (`role_id`),
  CONSTRAINT `FK84qlpfci484r1luck11eno6ec` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
]


def upgrade() -> None:
    for statement in TABLES:
        op.execute(statement)


def downgrade() -> None:
    raise NotImplementedError("the baseline holds production data; it is never downgraded")
