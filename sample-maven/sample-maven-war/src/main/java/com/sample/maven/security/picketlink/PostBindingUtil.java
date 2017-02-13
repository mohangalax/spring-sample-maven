package com.sample.maven.security.picketlink;

import static org.picketlink.identity.federation.core.util.StringUtil.isNotNull;

import lombok.extern.slf4j.Slf4j;

import org.picketlink.identity.federation.PicketLinkLogger;
import org.picketlink.identity.federation.PicketLinkLoggerFactory;
import org.picketlink.identity.federation.core.saml.v2.holders.DestinationInfoHolder;
import org.picketlink.identity.federation.core.util.Base64;
import org.picketlink.identity.federation.web.constants.GeneralConstants;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

/**
 * Utility for the HTTP/Post binding
 */
@Slf4j
public class PostBindingUtil {
  private static final PicketLinkLogger logger = PicketLinkLoggerFactory.getLogger();

  /**
   * Apply base64 encoding on the message
   * @param stringToEncode
   * @return String
   */
  public static String base64Encode(String stringToEncode) throws IOException {
    return Base64.encodeBytes(stringToEncode.getBytes("UTF-8"), Base64.DONT_BREAK_LINES);
  }

  /**
   * Apply base64 decoding on the message and return the byte array
   * @param encodedString
   * @return byte[]
   */
  public static byte[] base64Decode(String encodedString) {
    if (encodedString == null)
      throw logger.nullArgumentError("encodedString");

    return Base64.decode(encodedString);
  }

  /**
   * Apply base64 decoding on the message and return the stream
   * @param encodedString
   * @return InputStream
   */
  public static InputStream base64DecodeAsStream(String encodedString) {
    if (encodedString == null)
      throw logger.nullArgumentError("encodedString");

    return new ByteArrayInputStream(base64Decode(encodedString));
  }

  /**
   * Send the response to the redirected destination while adding the character encoding of "UTF-8"
   * as well as adding headers for cache-control and Pragma
   * @param holder
   *          - Destination URI where the response needs to redirect
   * @param response
   *          - HttpServletResponse
   * @param request
   *          - request boolean
   * @throws IOException
   */
  public static void sendPost(DestinationInfoHolder holder, HttpServletResponse response,
      boolean request) throws IOException {
    String key = request ? GeneralConstants.SAML_REQUEST_KEY : GeneralConstants.SAML_RESPONSE_KEY;

    String relayState = holder.getRelayState();
    String destination = holder.getDestination();
    String samlMessage = holder.getSamlMessage();

    if (destination == null)
      throw logger.nullArgumentError("Destination is null");

    response.setContentType("text/html");
    PrintWriter out = response.getWriter();
    common(holder.getDestination(), response);
    StringBuilder builder = new StringBuilder();

    builder.append("<HTML>");
    builder.append("<HEAD>");
    if (request)
      builder.append("<TITLE>HTTP Post Binding (Request)</TITLE>");
    else
      builder.append("<TITLE>HTTP Post Binding Response (Response)</TITLE>");

    builder.append("</HEAD>");
    builder.append("<BODY Onload=\"document.forms[0].submit()\">");

    builder.append("<FORM METHOD=\"POST\" ACTION=\"" + destination + "\">");
    builder.append("<INPUT TYPE=\"HIDDEN\" NAME=\"" + key + "\"" + " VALUE=\"" + samlMessage
        + "\"/>");
    if (isNotNull(relayState)) {
      builder.append("<INPUT TYPE=\"HIDDEN\" NAME=\"RelayState\" " + "VALUE=\"" + relayState
          + "\"/>");
    }
    builder.append("</FORM></BODY></HTML>");

    String str = builder.toString();
    log.info("SAML Post Binging Request : " + str);
    out.println(str);
    out.close();
  }

  /**
   * Pre-populate the HTTP header to make sure the credentials are not cached forever
   * @param destination
   *          - Destination URI where the response needs to redirect
   * @param response
   *          - HTTP Response object
   */
  private static void common(String destination, HttpServletResponse response) {
    response.setCharacterEncoding("UTF-8");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Cache-Control", "no-cache, no-store");
  }
}