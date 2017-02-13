package com.sample.maven.security.picketlink;

import com.google.common.base.Joiner;

import lombok.extern.slf4j.Slf4j;

import org.picketlink.identity.federation.api.saml.v2.response.SAML2Response;
import org.picketlink.identity.federation.core.ErrorCodes;
import org.picketlink.identity.federation.core.SerializablePrincipal;
import org.picketlink.identity.federation.core.exceptions.ConfigurationException;
import org.picketlink.identity.federation.core.exceptions.ParsingException;
import org.picketlink.identity.federation.core.exceptions.ProcessingException;
import org.picketlink.identity.federation.core.interfaces.ProtocolContext;
import org.picketlink.identity.federation.core.saml.v2.common.SAMLDocumentHolder;
import org.picketlink.identity.federation.core.saml.v2.constants.JBossSAMLURIConstants;
import org.picketlink.identity.federation.core.saml.v2.exceptions.AssertionExpiredException;
import org.picketlink.identity.federation.core.saml.v2.holders.IssuerInfoHolder;
import org.picketlink.identity.federation.core.saml.v2.impl.DefaultSAML2HandlerRequest;
import org.picketlink.identity.federation.core.saml.v2.interfaces.SAML2Handler.HANDLER_TYPE;
import org.picketlink.identity.federation.core.saml.v2.interfaces.SAML2HandlerRequest;
import org.picketlink.identity.federation.core.saml.v2.util.AssertionUtil;
import org.picketlink.identity.federation.saml.v2.assertion.AssertionType;
import org.picketlink.identity.federation.saml.v2.assertion.AttributeStatementType;
import org.picketlink.identity.federation.saml.v2.assertion.AttributeStatementType.ASTChoiceType;
import org.picketlink.identity.federation.saml.v2.assertion.AttributeType;
import org.picketlink.identity.federation.saml.v2.assertion.NameIDType;
import org.picketlink.identity.federation.saml.v2.assertion.StatementAbstractType;
import org.picketlink.identity.federation.saml.v2.assertion.SubjectType;
import org.picketlink.identity.federation.saml.v2.assertion.SubjectType.STSubType;
import org.picketlink.identity.federation.saml.v2.protocol.ResponseType;
import org.picketlink.identity.federation.saml.v2.protocol.ResponseType.RTChoiceType;
import org.picketlink.identity.federation.saml.v2.protocol.StatusType;
import org.picketlink.identity.federation.web.constants.GeneralConstants;
import org.picketlink.identity.federation.web.core.HTTPContext;
import org.picketlink.identity.federation.web.util.PostBindingUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.util.Assert;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
public class PicketLinkAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

  /** The logger. */
  final Logger logger = LoggerFactory.getLogger(PicketLinkAuthenticationFilter.class);

  /** The service url. */
  private String serviceUrl;

  /** The choose friendly name. */
  protected boolean chooseFriendlyName = true;

  /**
   * Instantiates a new picket link authentication filter.
   */
  public PicketLinkAuthenticationFilter() {
    super("/j_spring_picketlink_security_check");
  }

  /**
   * Instantiates a new picket link authentication filter.
   * @param defaultFilterProcessesUrl
   *          the default filter processes url
   */
  public PicketLinkAuthenticationFilter(String defaultFilterProcessesUrl) {
    super(defaultFilterProcessesUrl);
  }

  /*
   * (non-Javadoc)
   * @see org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter#
   * afterPropertiesSet()
   */
  @Override
  public void afterPropertiesSet() {
    super.afterPropertiesSet();
    log.info("serviceUrl: " + serviceUrl);
    Assert.hasLength(serviceUrl, "serviceUrl must be specified");
  }

  /*
   * (non-Javadoc)
   * @see org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter#
   * requiresAuthentication(javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected boolean requiresAuthentication(HttpServletRequest request, HttpServletResponse response) {
    boolean flag = true;
    try {
      InetAddress.getByName("isvcprod.corp.com").isReachable(500);
      // Normal workflow
      flag = super.requiresAuthentication(request, response);
    } catch (Exception e) {
      log.error("IDP is DOWN or not ACCESSIBLE.");
      // check for local DEV
      flag = false;
    }
    return flag;
  }

  /*
   * (non-Javadoc)
   * @see org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter#
   * attemptAuthentication(javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse)
   */
  @Override
  public Authentication attemptAuthentication(HttpServletRequest request,
      HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
    String samlMessage = request.getParameter(GeneralConstants.SAML_RESPONSE_KEY);
    if (samlMessage != null) {
      try {
        SAML2HandlerRequest saml2HandlerRequest = getSaml2HandlerRequest(request, response,
            samlMessage);
        final AssertionType assertion = getAssertion(saml2HandlerRequest);
        final Principal principal = getPrincipal(assertion);
        final Map<String, List<Object>> attributes = getAttributes(assertion);
        if (logger.isDebugEnabled()) {
          logger.debug("Assertion Subject Subtype BaseID Value: "
              + ((NameIDType) assertion.getSubject().getSubType().getBaseID()).getValue());
          logger.debug("Assertion Issuer Value: " + assertion.getIssuer().getValue());
          logger.debug("Principal Impl:" + principal.getClass().getCanonicalName());
          logger.debug("Name:" + principal.getName());
          Joiner.MapJoiner mapJoiner = Joiner.on("\n").withKeyValueSeparator("=");
          logger.debug(mapJoiner.join(attributes));
        }
        final PicketLinkAuthenticationToken token = new PicketLinkAuthenticationToken(principal,
            "", attributes, assertion);
        return this.getAuthenticationManager().authenticate(token);
      } catch (ProcessingException e) {
        throw new AuthenticationServiceException(e.getMessage());
      } catch (ConfigurationException e) {
        throw new AuthenticationServiceException(e.getMessage());
      } catch (ParsingException e) {
        throw new AuthenticationServiceException(e.getMessage());
      }
    }
    return null;
  }

  /**
   * Gets the saml2 handler request.
   * @param request
   *          the request
   * @param response
   *          the response
   * @param samlMessage
   *          the saml message
   * @return the saml2 handler request
   * @throws ParsingException
   *           the parsing exception
   * @throws ConfigurationException
   *           the configuration exception
   * @throws ProcessingException
   *           the processing exception
   */
  private SAML2HandlerRequest getSaml2HandlerRequest(HttpServletRequest request,
      HttpServletResponse response, String samlMessage) throws ParsingException,
      ConfigurationException, ProcessingException {
    byte[] base64DecodedResponse = PostBindingUtil.base64Decode(samlMessage);
    InputStream is = new ByteArrayInputStream(base64DecodedResponse);

    ServletContext context = request.getSession().getServletContext();
    SAML2Response saml2Response = new SAML2Response();
    saml2Response.getSAML2ObjectFromStream(is);
    SAMLDocumentHolder documentHolder = saml2Response.getSamlDocumentHolder();
    IssuerInfoHolder holder = new IssuerInfoHolder(this.serviceUrl);
    ProtocolContext protocolContext = new HTTPContext(request, response, context);
    SAML2HandlerRequest saml2HandlerRequest = new DefaultSAML2HandlerRequest(protocolContext,
        holder.getIssuer(), documentHolder, HANDLER_TYPE.SP);
    return saml2HandlerRequest;
  }

  /**
   * Gets the assertion.
   * @param saml2HandlerRequest
   *          the saml2 handler request
   * @return the assertion
   * @throws ConfigurationException
   *           the configuration exception
   * @throws ProcessingException
   *           the processing exception
   */
  private AssertionType getAssertion(SAML2HandlerRequest saml2HandlerRequest)
      throws ConfigurationException, ProcessingException {

    ResponseType responseType = (ResponseType) saml2HandlerRequest.getSAML2Object();

    if (responseType == null) {
      throw new IllegalArgumentException(ErrorCodes.NULL_ARGUMENT + "response type");
    }

    StatusType statusType = responseType.getStatus();
    if (statusType == null) {
      throw new IllegalArgumentException(ErrorCodes.NULL_ARGUMENT + "Status Type from the IDP");
    }

    String statusValue = statusType.getStatusCode().getValue().toASCIIString();
    if (JBossSAMLURIConstants.STATUS_SUCCESS.get().equals(statusValue) == false) {
      throw new SecurityException(ErrorCodes.IDP_AUTH_FAILED + "IDP forbid the user");
    }

    List<RTChoiceType> assertions = responseType.getAssertions();
    if (assertions.size() == 0) {
      throw new IllegalStateException(ErrorCodes.NULL_VALUE + "No assertions in reply from IDP");
    }

    AssertionType assertion = assertions.get(0).getAssertion();
    boolean expiredAssertion = AssertionUtil.hasExpired(assertion);
    if (expiredAssertion) {
      AssertionExpiredException aee = new AssertionExpiredException();
      throw new ProcessingException(ErrorCodes.EXPIRED_ASSERTION + "Assertion has expired", aee);
    }
    saml2HandlerRequest.addOption(GeneralConstants.ASSERTION, assertion);

    return assertion;
  }

  /**
   * Gets the principal.
   * @param assertion
   *          the assertion
   * @return the principal
   * @throws ProcessingException
   *           the processing exception
   * @throws ConfigurationException
   *           the configuration exception
   * @throws ParsingException
   *           the parsing exception
   */
  private Principal getPrincipal(AssertionType assertion) throws ProcessingException,
      ConfigurationException, ParsingException {

    SubjectType subject = assertion.getSubject();
    if (subject == null) {
      throw new AuthenticationServiceException(ErrorCodes.NULL_VALUE + "Subject in the assertion");
    }

    STSubType subType = subject.getSubType();
    if (subType == null) {
      throw new RuntimeException(ErrorCodes.NULL_VALUE + "Unable to find subtype via subject");
    }

    NameIDType nameID = (NameIDType) subType.getBaseID();
    if (nameID == null) {
      throw new RuntimeException(ErrorCodes.NULL_VALUE + "Unable to find username via subject");
    }

    final String username = nameID.getValue();

    logger.debug("found principal named: {} ", username);
    return new SerializablePrincipal(username);
  }

  /**
   * Gets the attributes.
   * @param assertion
   *          the assertion
   * @return the attributes
   */
  protected Map<String, List<Object>> getAttributes(AssertionType assertion) {

    Map<String, List<Object>> attributes = new HashMap<String, List<Object>>();

    Set<StatementAbstractType> statements = assertion.getStatements();
    for (StatementAbstractType statement : statements) {

      if (statement instanceof AttributeStatementType) {
        AttributeStatementType attrStat = (AttributeStatementType) statement;
        List<ASTChoiceType> attrs = attrStat.getAttributes();

        for (ASTChoiceType attrChoice : attrs) {
          AttributeType attr = attrChoice.getAttribute();
          String attributeName = attr.getName();

          if (chooseFriendlyName && attr.getFriendlyName() != null) {
            attributeName = attr.getFriendlyName();
          }

          if (attributes.containsKey(attributeName)) {
            List<Object> list = new ArrayList<Object>();
            list.addAll(attributes.get(attributeName));
            list.add(attr.getAttributeValue());
            attributes.put(attributeName, list);
          } else {
            attributes.put(attributeName, attr.getAttributeValue());
          }
        }
      }
    }
    return attributes;
  }

  /**
   * Gets the service url.
   * @return the service url
   */
  public String getServiceUrl() {
    return serviceUrl;
  }

  /**
   * Sets the service url.
   * @param serviceUrl
   *          the new service url
   */
  public void setServiceUrl(String serviceUrl) {
    this.serviceUrl = serviceUrl;
  }

}
