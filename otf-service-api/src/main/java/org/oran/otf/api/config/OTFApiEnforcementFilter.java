/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
##############################################################################*/


package org.oran.otf.api.config;

import com.google.common.base.Strings;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.onap.aaf.cadi.Access;
import org.onap.aaf.cadi.Access.Level;
import org.onap.aaf.cadi.ServletContextAccess;
import org.onap.aaf.cadi.util.Split;

public class OTFApiEnforcementFilter implements Filter {
  private static final Log log = LogFactory.getLog(OTFApiEnforcementFilter.class);
  private String type;
  private Map<String, List<String>> publicPaths;
  private Access access = null;

  public OTFApiEnforcementFilter(Access access, String enforce) throws ServletException {
    this.access = access;
    init(enforce);
  }

  @Override
  public void init(FilterConfig fc) throws ServletException {
    init(fc.getInitParameter("aaf_perm_type"));
    // need the Context for Logging, instantiating ClassLoader, etc
    ServletContextAccess sca = new ServletContextAccess(fc);
    if (access == null) {
      access = sca;
    }
  }

  private void init(final String ptypes) throws ServletException {
    if (Strings.isNullOrEmpty(ptypes)) {
      throw new ServletException("OTFApiEnforcement requires aaf_perm_type property");
    }
    String[] full = Split.splitTrim(';', ptypes);
    if (full.length <= 0) {
      throw new ServletException("aaf_perm_type property is empty");
    }

    type = full[0];
    publicPaths = new TreeMap<>();
    if (full.length > 1) {
      for (int i = 1; i < full.length; ++i) {
        String[] pubArray = Split.split(':', full[i]);
        if (pubArray.length == 2) {
          List<String> ls = publicPaths.get(pubArray[0]);
          if (ls == null) {
            ls = new ArrayList<>();
            publicPaths.put(pubArray[0], ls);
          }
          ls.add(pubArray[1]);
        }
      }
    }
  }

  @Override
  public void doFilter(ServletRequest req, ServletResponse resp, FilterChain fc)
      throws IOException, ServletException {
    HttpServletRequest hreq = (HttpServletRequest) req;
    final String meth = hreq.getMethod();
    String path = hreq.getContextPath(); // + hreq.getPathInfo();

    if (Strings.isNullOrEmpty(path) || "null".equals(path)) {
      path = hreq.getRequestURI().substring(hreq.getContextPath().length());
    }

    List<String> list = publicPaths.get(meth);
    if (list != null) {
      for (String p : publicPaths.get(meth)) {
        if (path.startsWith(p)) {
          access.printf(
              Level.INFO,
              "%s accessed public API %s %s\n",
              hreq.getUserPrincipal().getName(),
              meth,
              path);
          fc.doFilter(req, resp);
          return;
        }
      }
    }
    if (hreq.isUserInRole(type + '|' + path + '|' + meth)) {
      access.printf(
          Level.INFO,
          "%s is allowed access to %s %s\n",
          hreq.getUserPrincipal().getName(),
          meth,
          path);
      fc.doFilter(req, resp);
    } else {
      access.printf(
          Level.AUDIT,
          "%s is denied access to %s %s\n",
          hreq.getUserPrincipal().getName(),
          meth,
          path);
      ((HttpServletResponse) resp).sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
  }

  @Override
  public void destroy() {}
}
