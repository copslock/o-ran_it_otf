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


package org.oran.otf.camunda.configuration;

import org.glassfish.jersey.logging.LoggingFeature;
import org.glassfish.jersey.message.MessageUtils;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.client.ClientRequestContext;
import javax.ws.rs.client.ClientRequestFilter;
import javax.ws.rs.client.ClientResponseContext;
import javax.ws.rs.client.ClientResponseFilter;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.FeatureContext;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.WriterInterceptor;
import javax.ws.rs.ext.WriterInterceptorContext;
import java.io.*;
import java.net.URI;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

public class OTFLoggingFeature extends LoggingFeature implements ContainerRequestFilter, ContainerResponseFilter,
        ClientRequestFilter, ClientResponseFilter, WriterInterceptor {

    private static final boolean printEntity = true;
    private static final int maxEntitySize = 8 * 1024;
    private final Logger logger = Logger.getLogger("OTFLoggingFeature");
    private static final String ENTITY_LOGGER_PROPERTY = OTFLoggingFeature.class.getName();
    private static final String NOTIFICATION_PREFIX = "* ";
    private static final String REQUEST_PREFIX = "> ";
    private static final String RESPONSE_PREFIX = "< ";
    private static final String AUTHORIZATION = "Authorization";
    private static final String EQUAL = " = ";
    private static final String HEADERS_SEPARATOR = ", ";
    private static List<String> requestHeaders;

    static {
        requestHeaders = new ArrayList<>();
        requestHeaders.add(AUTHORIZATION);
    }

    public OTFLoggingFeature(Logger logger, Level level, Verbosity verbosity, Integer maxEntitySize) {
        super(logger, level, verbosity, maxEntitySize);
    }

    @Override
    public boolean configure(FeatureContext context) {
        context.register(this);
        return true;
    }

    private Object getEmail(Object authorization){
        try{
            String encoded = ((String) authorization).split(" ")[1];
            String decoded =  new String(Base64.getDecoder().decode(encoded));
            return decoded.split(":")[0];
        }
        catch (Exception e){
            return authorization;
        }
    }

    @Override
    public void filter(final ClientRequestContext context) {
        final StringBuilder b = new StringBuilder();
        printHeaders(b, context.getStringHeaders());
        printRequestLine(b, "Sending client request", context.getMethod(), context.getUri());

        if (printEntity && context.hasEntity()) {
            final OutputStream stream = new LoggingStream(b, context.getEntityStream());
            context.setEntityStream(stream);
            context.setProperty(ENTITY_LOGGER_PROPERTY, stream);
            // not calling log(b) here - it will be called by the interceptor
        } else {
            log(b);
        }
    }

    @Override
    public void filter(final ClientRequestContext requestContext, final ClientResponseContext responseContext) throws IOException {
        final StringBuilder b = new StringBuilder();
        printResponseLine(b, "Client response received", responseContext.getStatus());

        if (printEntity && responseContext.hasEntity()) {
            responseContext.setEntityStream(logInboundEntity(b, responseContext.getEntityStream(),
                    MessageUtils.getCharset(responseContext.getMediaType())));
        }
        log(b);
    }

    @Override
    public void filter(final ContainerRequestContext context) throws IOException {
        final StringBuilder b = new StringBuilder();
        printHeaders(b, context.getHeaders());
        printRequestLine(b, "Server has received a request", context.getMethod(), context.getUriInfo().getRequestUri());

        if (printEntity && context.hasEntity()) {
            context.setEntityStream(logInboundEntity(b, context.getEntityStream(), MessageUtils.getCharset(context.getMediaType())));
        }
        log(b);
    }

    @Override
    public void filter(final ContainerRequestContext requestContext, final ContainerResponseContext responseContext) {
        final StringBuilder b = new StringBuilder();
        printResponseLine(b, "Server responded with a response", responseContext.getStatus());

        if (printEntity && responseContext.hasEntity()) {
            final OutputStream stream = new LoggingStream(b, responseContext.getEntityStream());
            responseContext.setEntityStream(stream);
            requestContext.setProperty(ENTITY_LOGGER_PROPERTY, stream);
            // not calling log(b) here - it will be called by the interceptor
        } else {
            log(b);
        }
    }

    @Override
    public void aroundWriteTo(final WriterInterceptorContext writerInterceptorContext) throws IOException, WebApplicationException {
        final LoggingStream stream = (LoggingStream) writerInterceptorContext.getProperty(ENTITY_LOGGER_PROPERTY);
        writerInterceptorContext.proceed();
        if (stream != null) {
            log(stream.getStringBuilder(MessageUtils.getCharset(writerInterceptorContext.getMediaType())));
        }
    }

    private static class LoggingStream extends FilterOutputStream {
        private final StringBuilder b;
        private final ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();

        LoggingStream(final StringBuilder b, final OutputStream inner) {
            super(inner);

            this.b = b;
        }

        StringBuilder getStringBuilder(Charset charset) {
            // write entity to the builder
            final byte[] entity = byteArrayOutputStream.toByteArray();

            b.append(new String(entity, 0, Math.min(entity.length, maxEntitySize), charset));
            if (entity.length > maxEntitySize) {
                b.append("...more...");
            }
            b.append('\n');

            return b;
        }

        public void write(final int i) throws IOException {
            if (byteArrayOutputStream.size() <= maxEntitySize) {
                byteArrayOutputStream.write(i);
            }
            out.write(i);
        }
    }

    private void printHeaders(StringBuilder b, MultivaluedMap<String, String> headers) {
        for (String header : requestHeaders) {
            if (Objects.nonNull(headers.get(header))) {
                if(header.equalsIgnoreCase("Authorization")){
                    b.append(header).append(EQUAL).append(getEmail(headers.get(header).get(0))).append(HEADERS_SEPARATOR);
                }
                else{
                    b.append(header).append(EQUAL).append(headers.get(header)).append(HEADERS_SEPARATOR);
                }
            }
        }
        int lastIndex = b.lastIndexOf(HEADERS_SEPARATOR);
        if (lastIndex != -1) {
            b.delete(lastIndex, lastIndex + HEADERS_SEPARATOR.length());
            b.append("\n");
        }
    }

    private void log(final StringBuilder b) {
        String message = b.toString();
        if (logger != null) {
            logger.info(message);
        }
    }

    private void printRequestLine(final StringBuilder b, final String note, final String method, final URI uri) {
        b.append(NOTIFICATION_PREFIX)
                .append(note)
                .append(" on thread ").append(Thread.currentThread().getId())
                .append(REQUEST_PREFIX).append(method).append(" ")
                .append(uri.toASCIIString()).append("\n");
    }

    private void printResponseLine(final StringBuilder b, final String note, final int status) {
        b.append(NOTIFICATION_PREFIX)
                .append(note)
                .append(" on thread ").append(Thread.currentThread().getId())
                .append(RESPONSE_PREFIX)
                .append(Integer.toString(status))
                .append("\n");
    }

    private InputStream logInboundEntity(final StringBuilder b, InputStream stream, final Charset charset) throws IOException {
        if (!stream.markSupported()) {
            stream = new BufferedInputStream(stream);
        }
        stream.mark(maxEntitySize + 1);
        final byte[] entity = new byte[maxEntitySize + 1];
        final int entitySize = stream.read(entity);
        b.append(new String(entity, 0, Math.min(entitySize, maxEntitySize), charset));
        if (entitySize > maxEntitySize) {
            b.append("...more...");
        }
        b.append('\n');
        stream.reset();
        return stream;
    }
}