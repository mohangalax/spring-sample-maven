package com.sample.maven.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import com.sample.maven.security.picketlink.PicketLinkEntryPoint;



@Configuration
@EnableWebSecurity
@ImportResource("classpath:context/picketlink-security-config.xml")
public class PicketlinkConfig extends WebSecurityConfigurerAdapter {

  @Value("${picketlink.identity.url}")
  private String picketlinkIdentityUrl;
  @Value("${picketlink.service.url}")
  private String picketlinkServiceUrl;
  @Value("${picketlink.filter.processes.url}")
  private String picketlinkFilterProcessesUrl;
  @Value("${picketlink.issuer.ais.sample}")
  private String issuerSample;
  @Value("${picketlink.relay.state}")
  private String relayState;

  /**
   * Get a PicketLinkEntryPoint responsible for manage the session identity
   * @return PicketLinkEntryPoint
   */
  @Bean(name = "entryPoint")
  @Lazy(true)
  public PicketLinkEntryPoint entryPoint() {
    final PicketLinkEntryPoint bean = new PicketLinkEntryPoint();
    bean.setIdentityUrl(picketlinkIdentityUrl);

    // Workaround for localhost not being HTTPS
    if (picketlinkServiceUrl.contains("localhost")) {
      picketlinkServiceUrl = picketlinkServiceUrl.replace("https", "http");
    }

    bean.setServiceUrl(picketlinkServiceUrl);
    bean.setIssuerSample(issuerSample);
    bean.setRelayState(relayState);
    return bean;
  }
}
