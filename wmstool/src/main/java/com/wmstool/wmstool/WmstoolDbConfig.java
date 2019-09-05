package com.wmstool.wmstool;

import java.util.Properties;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "WmstoolEntityManagerFactory", transactionManagerRef = "WmstoolTransactionManager", basePackages = {
		"com.wmstool.wmstool.repositories" })
public class WmstoolDbConfig {

	private static final String DB_URL = "spring.datasource.url";
	private static final String DB_USERNAME = "spring.datasource.username";
	private static final String DB_PASSWORD = "spring.datasource.password";
	private static final String DB_DIALECT = "spring.datasource.dialect";
	private static final String ENTITYMANAGER_PACKAGES_TO_SCAN = "com.wmstool.wmstool.models";
	private static final String PROPERTY_NAME_HIBERNATE_JDBC_BATCH_SIZE = "hibernate.jdbc.batch_size";
	private static final String PROPERTY_NAME_HIBERNATE_SHOW_SQL = "hibernate.show_sql";
	private static final String PROPERTY_NAME_HIBERNATE_FMT_SQL = "hibernate.format_sql";
	private static final String PROPERTY_NAME_HIBERNATE_HBM2DDL_AUTO = "hibernate.hbm2ddl.auto";

	@Autowired
	private Environment env;

	@Primary
	@Bean
	public DataSource WmstoolDataSource() {
		DriverManagerDataSource dataSource = new DriverManagerDataSource();
		dataSource.setUrl(env.getProperty(DB_URL));
		dataSource.setUsername(env.getProperty(DB_USERNAME));
		dataSource.setPassword(env.getProperty(DB_PASSWORD));
		return dataSource;
	}

	@Primary
	@Bean(name = "WmstoolEntityManagerFactory")
	public LocalContainerEntityManagerFactoryBean WmstoolEntityManagerFactory() {
		final LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
		em.setDataSource(WmstoolDataSource());

		final HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
		vendorAdapter.setDatabasePlatform(env.getProperty(DB_DIALECT));
		vendorAdapter.setShowSql(false);
		em.setJpaVendorAdapter(vendorAdapter);

		em.setPackagesToScan(ENTITYMANAGER_PACKAGES_TO_SCAN);

		Properties properties = new Properties();
		properties.put(PROPERTY_NAME_HIBERNATE_FMT_SQL, env.getProperty(PROPERTY_NAME_HIBERNATE_FMT_SQL));
		properties.put(PROPERTY_NAME_HIBERNATE_JDBC_BATCH_SIZE,
				env.getProperty(PROPERTY_NAME_HIBERNATE_JDBC_BATCH_SIZE));
		properties.put(PROPERTY_NAME_HIBERNATE_SHOW_SQL, env.getProperty(PROPERTY_NAME_HIBERNATE_SHOW_SQL));
		properties.put(PROPERTY_NAME_HIBERNATE_HBM2DDL_AUTO, env.getProperty(PROPERTY_NAME_HIBERNATE_HBM2DDL_AUTO));
		em.setJpaProperties(properties);

		return em;
	}

	@Primary
	@Bean(name = "WmstoolTransactionManager")
	public PlatformTransactionManager WmstoolTransactionManager(
			@Qualifier("WmstoolEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
		return new JpaTransactionManager(entityManagerFactory);
	}

}
