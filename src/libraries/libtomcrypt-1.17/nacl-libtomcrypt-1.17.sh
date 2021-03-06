#!/bin/bash
# Copyright (c) 2011 The Native Client Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# nacl-libtomcrypt-1.17.sh
#
# usage:  nacl-libtomcrypt-1.17.sh
#
# this script downloads, patches, and builds libtomcrypt for Native Client
#

readonly URL=http://commondatastorage.googleapis.com/nativeclient-mirror/nacl/crypt-1.17.tar.bz2
#readonly URL=http://libtomcrypt.googlecode.com/files/crypt-1.17.tar.bz2
readonly PATCH_FILE=libtomcrypt-1.17.patch
readonly PACKAGE_NAME=libtomcrypt-1.17

source ../../build_tools/common.sh


CustomBuildStep() {
  Banner "Building ${PACKAGE_NAME}"
  ChangeDir ${NACL_PACKAGES_REPOSITORY}/${PACKAGE_NAME}
  export CC=${NACLCC}
  export CXX=${NACLCXX}
  export AR=${NACLAR}
  export LD=${NACLLD}
  export RANLIB=${NACLRANLIB}
  DefaultBuildStep
}


CustomInstallStep() {
  # copy libs and headers manually
  Banner "Installing ${PACKAGE_NAME} to ${NACL_SDK_USR}"
  ChangeDir ${NACL_SDK_USR_INCLUDE}
  Remove ${PACKAGE_NAME}
  readonly THIS_PACKAGE_PATH=${NACL_PACKAGES_REPOSITORY}/${PACKAGE_NAME}
  cp ${THIS_PACKAGE_PATH}/src/headers/*.h ./
  ChangeDir ${NACL_SDK_USR_LIB}
  cp ${THIS_PACKAGE_PATH}/*.a .
  DefaultTouchStep
}


CustomPackageInstall() {
  DefaultPreInstallStep
  DefaultDownloadBzipStep
  DefaultExtractBzipStep
  DefaultPatchStep
  CustomBuildStep
  CustomInstallStep
  DefaultCleanUpStep
}


CustomPackageInstall
exit 0
