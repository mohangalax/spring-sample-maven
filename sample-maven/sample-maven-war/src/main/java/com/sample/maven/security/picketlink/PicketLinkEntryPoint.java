package com.sample.maven.security.picketlink;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import org.picketlink.identity.federation.api.saml.v2.request.SAML2Request;
import org.picketlink.identity.federation.core.exceptions.ConfigurationException;
import org.picketlink.identity.federation.core.saml.v2.common.IDGenerator;
import org.picketlink.identity.federation.core.saml.v2.holders.DestinationInfoHolder;
import org.picketlink.identity.federation.saml.v2.protocol.AuthnRequestType;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.util.Assert;
import org.xml.sax.SAXException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
public class PicketLinkEntryPoint implements AuthenticationEntryPoint, InitializingBean {

  @Getter
  @Setter
  private String identityUrl, serviceUrl, issuerSample, relayState;

  /*
   * (non-Javadoc)
   * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
   */
  @Override
  public void afterPropertiesSet() throws Exception {
    log.info("identityUrl: " + identityUrl);
    log.info("serviceUrl: " + serviceUrl);
    log.info("issuerSample: " + issuerSample);
    log.info("relayState: " + relayState);

    Assert.hasLength(this.identityUrl, "identityUrl must be specified");
    Assert.hasLength(this.serviceUrl, "serviceUrl must be specified");
    Assert.hasLength(this.issuerSample, "issuerAisSynd must be specified");
    Assert.hasLength(this.relayState, "relayState must be specified");
  }

  /*
   * (non-Javadoc)
   * @see org.springframework.security.web.AuthenticationEntryPoint#commence(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse,
   * org.springframework.security.core.AuthenticationException)
   */
  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response,
      AuthenticationException authException) throws IOException, ServletException {
    try {
      AuthnRequestType authnRequest = createSAMLRequest();
      sendRequestToIDP(authnRequest, relayState, response);
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }

  /**
   * Creates the saml request.
   * @return the authn request type
   * @throws ConfigurationException
   *           the configuration exception
   */
  private AuthnRequestType createSAMLRequest() throws ConfigurationException {

    SAML2Request saml2Request = new SAML2Request();
    String id = IDGenerator.create("ID_");
    return saml2Request.createAuthnRequestType(id, serviceUrl.trim(), identityUrl.trim(),
    		issuerSample.trim());
  }

  /**
   * Send request to idp.
   * @param authnRequest
   *          the authn request
   * @param relayState
   *          the relay state
   * @param response
   *          the response
   * @throws IOException
   *           Signals that an I/O exception has occurred.
   * @throws SAXException
   *           the SAX exception
   * @throws GeneralSecurityException
   *           the general security exception
   */
  protected void sendRequestToIDP(AuthnRequestType authnRequest, String relayState,
      HttpServletResponse response) throws IOException, SAXException, GeneralSecurityException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    SAML2Request saml2Request = new SAML2Request();
    saml2Request.marshall(authnRequest, baos);
    log.info("SAML2 request: " + baos.toString());
    String samlMessage = PostBindingUtil.base64Encode(baos.toString());
    String destination = authnRequest.getDestination().toASCIIString();
    PostBindingUtil.sendPost(new DestinationInfoHolder(destination, samlMessage, relayState),
        response, true);
  }
}
