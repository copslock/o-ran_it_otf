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


package org.oran.otf.common.utility.sftp;

import org.apache.commons.io.IOUtils;
import org.apache.commons.vfs2.*;
import org.apache.commons.vfs2.provider.sftp.IdentityInfo;
import org.apache.commons.vfs2.provider.sftp.SftpFileSystemConfigBuilder;

import java.io.File;
import java.io.InputStream;


public class SftpUtility {

    public static byte[] getFile(String host, String artifactPath, String privateKeyPath, String privateKeyUsername, String privateKeyPasspharase) throws Exception {
        String remoteURI = "sftp://" + privateKeyUsername + "@" + host + "/" + artifactPath;

        FileSystemOptions fsOptions = new FileSystemOptions();
        FileSystemManager fsManager = null;
        byte[] bytes = null;
        SftpFileSystemConfigBuilder builder = SftpFileSystemConfigBuilder.getInstance();
        builder.setUserDirIsRoot(fsOptions, false);
        builder.setStrictHostKeyChecking(fsOptions, "no");
        IdentityInfo identityInfo = new IdentityInfo(new File(privateKeyPath), privateKeyPasspharase.getBytes());
        builder.setIdentityInfo(fsOptions, identityInfo);
        fsManager = VFS.getManager();
        FileObject remoteFileObject = fsManager.resolveFile(remoteURI, fsOptions);
        if(!remoteFileObject.isFile()) {
            remoteFileObject.close();
            throw new Exception("Expected a file, but supplied filePath was not a file.");
        }
        InputStream is = remoteFileObject.getContent().getInputStream();
        bytes = IOUtils.toByteArray(is);
        remoteFileObject.close();
        return bytes;

    }

    public static FileObject getDirectory(String host, String artifactPath, String privateKeyPath, String privateKeyUsername, String privateKeyPasspharase) throws Exception {
        String remoteURI = "sftp://" + privateKeyUsername + "@" + host + "/" + artifactPath;

        FileSystemOptions fsOptions = new FileSystemOptions();
        FileSystemManager fsManager = null;
        SftpFileSystemConfigBuilder builder = SftpFileSystemConfigBuilder.getInstance();
        builder.setUserDirIsRoot(fsOptions, false);
        builder.setStrictHostKeyChecking(fsOptions, "no");
        IdentityInfo identityInfo = new IdentityInfo(new File(privateKeyPath), privateKeyPasspharase.getBytes());
        builder.setIdentityInfo(fsOptions, identityInfo);
        fsManager = VFS.getManager();
        FileObject fileObject = fsManager.resolveFile(remoteURI, fsOptions);
        if(fileObject.isFolder()) {
            return fileObject;
        }
        fileObject.close();
        throw new Exception("Expected a folder, but supplied filePath was not a folder.");
    }

    public static void uploadFile(String host, String artifactPath, String privateKeyPath, String privateKeyUsername, String privateKeyPasspharase, File tempFile) throws Exception {
        String remoteURI = "sftp://" + privateKeyUsername + "@" + host + "/" + artifactPath;

        FileSystemOptions fsOptions = new FileSystemOptions();
        FileSystemManager fsManager = null;
        SftpFileSystemConfigBuilder builder = SftpFileSystemConfigBuilder.getInstance();
        builder.setUserDirIsRoot(fsOptions, false);
        builder.setStrictHostKeyChecking(fsOptions, "no");
        IdentityInfo identityInfo = new IdentityInfo(new File(privateKeyPath), privateKeyPasspharase.getBytes());
        builder.setIdentityInfo(fsOptions, identityInfo);
        fsManager = VFS.getManager();
        //resolve file location
        FileObject remoteFileObject = fsManager.resolveFile(remoteURI, fsOptions);
        FileObject sourceFile = fsManager.resolveFile(tempFile.getAbsolutePath());
        //if file exists then override, else create file
        remoteFileObject.copyFrom(sourceFile, Selectors.SELECT_SELF);
        remoteFileObject.close();
        sourceFile.close();
    }


}
