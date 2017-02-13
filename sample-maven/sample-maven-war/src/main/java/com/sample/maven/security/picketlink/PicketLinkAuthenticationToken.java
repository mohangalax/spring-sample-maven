package com.sample.maven.security.picketlink;

import org.picketlink.identity.federation.saml.v2.assertion.AssertionType;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PicketLinkAuthenticationToken extends AbstractAuthenticationToken {

  /** The Constant serialVersionUID. */
  private static final long serialVersionUID = 4195597862502416329L;

  /** The principal. */
  private final Object principal;

  /** The credentials. */
  private final Object credentials;

  /** The assertion. */
  private final AssertionType assertion;

  /** The attributes. */
  private final Map<String, List<Object>> attributes;

/*  @Override
  public String getName() {
    if (attributes.size() > 0 && attributes.get("mail") != null
        && attributes.get("mail").size() == 1) {
      return attributes.get("mail").get(0).toString();
    } else {
      return "INVALID USER or USER NOT FOUND";
    }
  }*/

  /**
   * Instantiates a new picket link authentication token.
   * @param principal
   *          the principal
   * @param credentials
   *          the credentials
   * @param attributes
   *          the attributes
   * @param assertion
   *          the assertion
   */
  public PicketLinkAuthenticationToken(final Object principal, final Object credentials,
      Map<String, List<Object>> attributes, final AssertionType assertion) {

    super(null);
    this.principal = principal;
    this.credentials = credentials;
    this.attributes = attributes;
    this.assertion = assertion;
    setAuthenticated(true);
  }

  /**
   * Instantiates a new picket link authentication token.
   * @param principal
   *          the principal
   * @param credentials
   *          the credentials
   * @param authorities
   *          the authorities
   * @param assertion
   *          the assertion
   */
  public PicketLinkAuthenticationToken(final Object principal, final Object credentials,
      final Collection<? extends GrantedAuthority> authorities, final AssertionType assertion) {

    super(authorities);
    this.principal = principal;
    this.credentials = credentials;
    this.attributes = new HashMap<String, List<Object>>();
    this.assertion = assertion;
    setAuthenticated(true);
  }

  /**
   * Instantiates a new picket link authentication token.
   * @param principal
   *          the principal
   * @param credentials
   *          the credentials
   * @param authorities
   *          the authorities
   * @param attributes
   *          the attributes
   * @param assertion
   *          the assertion
   */
  public PicketLinkAuthenticationToken(final Object principal, final Object credentials,
      final Collection<? extends GrantedAuthority> authorities,
      Map<String, List<Object>> attributes, final AssertionType assertion) {

    super(authorities);
    this.principal = principal;
    this.credentials = credentials;
    this.attributes = attributes;
    this.assertion = assertion;
    setAuthenticated(true);
  }

  /*
   * (non-Javadoc)
   * @see org.springframework.security.core.Authentication#getCredentials()
   */
  @Override
  public Object getCredentials() {
    return this.credentials;
  }

  /*
   * (non-Javadoc)
   * @see org.springframework.security.core.Authentication#getPrincipal()
   */
  @Override
  public Object getPrincipal() {
    return this.principal;
  }

  /**
   * Gets the attributes.
   * @return the attributes
   */
  public Map<String, List<Object>> getAttributes() {
    return attributes;
  }

  /**
   * Gets the assertion.
   * @return the assertion
   */
  public AssertionType getAssertion() {
    return assertion;
  }

}
